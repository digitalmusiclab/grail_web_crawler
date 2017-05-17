'use strict';

// Load dependencies
const Logger = rootRequire('lib/logger');
const SpotifyApi = require('./../api');
const RateLimiter = rootRequire('lib/rate-limiter').Spotify;
const MixRadioTrack = rootRequire('manifests/mixradio/models').Track;
const TrackCriteriaMatch = rootRequire("criteria/track");
const QueryHelper = rootRequire("lib/queries");
const db = rootRequire("lib/database");
const _ = require("lodash");


/*
    Job Data = {
        isrc: "123abc",
        tracks: [{
            "mr_track_id": "12342", 
            "mr_track_name": "Sabotage",
            "mr_track_position": "5",
            "mr_release_id": "12342",
            "mr_artist_id": "12342",
            "sp_track_id": "ABCD1234"
        }]
    }
*/
exports = module.exports = function process(job, done) {

    const isrc = job.data.isrc;
    const mr_tracks = job.data.tracks;
    
    RateLimiter(process.pid, (error, timeLeft) => {

        // Rate limiter reported an error, exit immediately
        if (error) {
            return done(error);
        }

        // Send Request To MusicBrainz API
        const sendRequest = function () {

            SpotifyApi.Track.getByIsrc(isrc)
            .then( (spotifyTracks) => {
                // Filter out tracks without atleast one artist
                spotifyTracks = _.filter(spotifyTracks, track => (track.artists.length > 0));

                // Pluck Spotify Track IDs Returned from API
                const spotifyTrackIds = _.map(spotifyTracks, "id");

                // MixRadio Tracks that have known Spotify Track ID need to be Updated
                const mixradioTracksToUpdate = _.filter(mr_tracks, (mr_track) => {
                    return _.includes(spotifyTrackIds, mr_track.sp_track_id);
                });

                // MixRadio Tracks that have unknown Spotify Track ID need to be Inserted
                const mixradioTracksToInsert = _.filter(mr_tracks, (mr_track) => {
                    return !(_.includes(spotifyTrackIds, mr_track.sp_track_id));
                });

                // Return Spotify Tracks, and Mixradio Tracks to be Inserted and Updated
                return [spotifyTracks, mixradioTracksToInsert, mixradioTracksToUpdate];
            })
            .then( ([spotifyTracks, mixradioTracksToInsert, mixradioTracksToUpdate]) => {
                // TODO: Move this into a transaction so no stale data upon db failures
                const insertTracksPromise = insertTracks(mixradioTracksToInsert, spotifyTracks);
                const updateTracksPromise = updateTracks(mixradioTracksToUpdate, spotifyTracks);
                return Promise.all([insertTracksPromise, updateTracksPromise]);
            })
            .then( ([insertedTracks, updatedTracks]) => {
                return done(null, { insertedTracks, updatedTracks });
            })
            .catch( (error) => {
                return done(error);
            });
        }


        // Respect the rate limit before making the request
        const time = Number.parseInt(timeLeft, 10);
        const sleepTime = Math.max(time, 0);

        return setTimeout(sendRequest, sleepTime);
    });
};



////////////////////////////////////////////////////////////////////////////////////
// Track Insert
////////////////////////////////////////////////////////////////////////////////////

/* Inserts an array of new Spotify Tracks into Grail Track and related tables */
const insertTracks = (mr_tracks, sp_tracks) => {

    // Spotify Track map, key'd by Spotify Track ID
    const spotifyTrackMapById = _.keyBy(sp_tracks, "id");

    let promise = Promise.resolve();

    // TODO: Split into individual db write jobs
    const insertTrackPromises = _.map(mr_tracks, (mixradioTrack) => {
        const mr_track = new MixRadioTrack(mixradioTrack);
        const sp_track = spotifyTrackMapById[mixradioTrack.sp_track_id];
        return insertTrack(mr_track, sp_track);
    });

    return Promise.all(insertTrackPromises);
}


/* Insert a new Spotify Track into Grail Track and related tables */
const insertTrack = (mr_track, sp_track) => {

    // Start database transaction
    return db.transaction( (trx) => {
        
        // Find and Update or Create new references in Grail Artists and Release Tables
        const grailArtists  = findAndUpdateOrCreateSpotifyArtist(mr_track, sp_track, trx);
        const grailReleases = findAndUpdateOrCreateSpotifyRelease(mr_track, sp_track, trx);

        return Promise.all([grailArtists, grailReleases])
            .then( ([grail_artist_ids, grail_release_ids]) => {
                return insertTrackIntoGrail(grail_artist_ids, grail_release_ids, mr_track, sp_track, trx);
            });
    }); 

}


/* Returns an promise of an array of grail_artist_ids */
const findAndUpdateOrCreateSpotifyArtist = (mr_track, sp_track, trx) => {
    
    const queryParams = {
        grail_table: "grail_artist",
        grail_table_unique_attribute: "grail_artist_id",
        grail_constraint_attribute: "mixradio_artist_id",
        grail_constraint_value: mr_track.artist_id,
        new_attributes: {
            spotify_artist_id: sp_track.artists[0].artist_id
        },
        find_constraint_attribute: "spotify_artist_id",
        find_constraint_value: sp_track.artists[0].artist_id,
        insert_constraint_distinct_columns: [
            "spotify_artist_criteria",
            "facebook_artist_id",
            "digital7_US_artist_id",
            "digital7_UK_artist_id",
            "digital7_AU_artist_id",
            "openaura_artist_id",
            "musixmatch_WW_artist_id",
            "jambase_artist_id",
            "fma_artist_id",
            "seatgeek_artist_id",
            "seatwave_artist_id",
            "lyricfind_US_artist_id",
            "rdio_artist_id",
            "echonest_artist_id",
            "twitter_artist_id",
            "tumblr_artist_id",
            "musicbrainz_artist_id",
            "musicbrainz_artist_criteria",
            "mixradio_artist_id",
            "mixradio_artist_name",
            "mixradio_artist_cardinality",
            "lastfm_artist_id",
            "lastfm_artist_criteria"
        ]
    };

    return QueryHelper.findAndUpdateorCreate(queryParams, trx);
}

/* Returns an promise of an array of grail_release_ids */
const findAndUpdateOrCreateSpotifyRelease = (mr_track, sp_track, trx) => {

    const queryParams = {
        grail_table: "grail_release",
        grail_table_unique_attribute: "grail_release_id",
        grail_constraint_attribute: "mixradio_release_id",
        grail_constraint_value: mr_track.release_id,
        new_attributes: {
            spotify_release_id: sp_track.release_id
        },
        find_constraint_attribute: "spotify_release_id",
        find_constraint_value: sp_track.release_id,
        insert_constraint_distinct_columns: [
            "musicbrainz_release_id",
            "musicbrainz_release_criteria",
            "lastfm_release_id",
            "lastfm_release_criteria",
            "mixradio_release_id", 
            "mixradio_release_name", 
            "mixradio_release_cardinality"
        ]
    };
    
    return QueryHelper.findAndUpdateorCreate(queryParams, trx);
}

/* Insert Spotify Track into Grail Track with newly inserted Grail Artist, and Release IDs */
const insertTrackIntoGrail = (grail_artist_ids, grail_release_ids, mr_track, sp_track, trx) => {

    // Spotify Track Criteria Score
    const criteriaScore = TrackCriteriaMatch(mr_track, sp_track);

    // Distinct Columns To Copy From Grail Track When Inserting A New Track
    const distinctColumns = [
        "isrc",
        "musicbrainz_track_id",
        "musicbrainz_track_criteria",
        "echonest_track_id",
        "lyricfind_US_track_id",
        "musixmatch_track_id",
        "mixradio_track_id",
        "mixradio_track_name",
        "mixradio_track_position",
        "msd_track_id",
        "lastfm_track_id",
        "lastfm_track_criteria",
    ]

    return trx("grail_track")
        .distinct(distinctColumns)
        .where('mixradio_track_id', mr_track.id)
        .then( (distinctTracks) => {
            
            let insertTracks = [];

            _.each(distinctTracks, (track) => {
                _.each(grail_artist_ids, (grail_artist_id) => {
                    _.each(grail_release_ids, (grail_release_id) => {

                        const newAttributes = {
                            grail_artist_id,
                            grail_release_id,
                            spotify_track_id: sp_track.id,
                            spotify_track_criteria: JSON.stringify(criteriaScore)
                        }

                        insertTracks.push(_.merge(track, newAttributes));
                    })
                });
            });

            return insertTracks;
        })
        .then( (newTracks) => {
            const chunkSize = newTracks.length;
            return trx.batchInsert('grail_track', newTracks, chunkSize);
        });
}


////////////////////////////////////////////////////////////////////////////////////
// Track Update
////////////////////////////////////////////////////////////////////////////////////


const updateTracks = (mr_tracks, sp_tracks) => {

    // Spotify Track map, key'd by Spotify Track ID
    const spotifyTrackMapById = _.keyBy(sp_tracks, "id");

    const updateTrackPromises = _.map(mr_tracks, (mixradioTrack) => {
        const mr_track = new MixRadioTrack(mixradioTrack);
        const sp_track = spotifyTrackMapById[mixradioTrack.sp_track_id];
        return updateTrack(mr_track, sp_track);
    });

    return Promise.all(updateTrackPromises);
}


const updateTrack = (mr_track, sp_track) => {

    const criteriaScore = TrackCriteriaMatch(mr_track, sp_track);
    const criteriaJsonString = JSON.stringify(criteriaScore);

    return db("grail_track")
        .where("spotify_track_id", sp_track.id)
        .update("spotify_track_criteria", criteriaJsonString);
}