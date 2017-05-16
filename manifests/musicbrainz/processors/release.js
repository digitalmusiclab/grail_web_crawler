'use strict';

// Load dependencies
const Logger = rootRequire('lib/logger');
const MusicBrainz = require('./../api');
const RateLimiter = rootRequire('lib/rate-limiter').MusicBrainz;
const MixRadioRelease = rootRequire('manifests/mixradio/models').Release;
const ReleaseCriteriaMatch = rootRequire('criteria/release');
const QueryHelper = rootRequire("lib/queries");
const db = rootRequire("lib/database");
const _ = require("lodash");

/*
    Job Data JSON Object
    ===================================
    mr_release_id: 1321422,
    mr_release_name: "I Should Coco",
    mr_release_cardinality: "13",
    mr_artist_id: "10055880",
    mr_artist_name: "Remember Me Soundtrack",
    mb_release_id: "NULL",
    mr_release_tracks: [{
        "mr_track_id": "1321455",
        "mr_track_name": "Lenny",
        "mr_track_position": "6",
        "mb_track_id": "NULL"
    }]
    ===================================
*/

exports = module.exports = function process(job, done) {

    const mixradioRelease = new MixRadioRelease(job.data);

    RateLimiter(process.pid, (error, timeLeft) => {

        // Rate limiter reported an error, exit immediately
        if (error) {
            return done(error);
        }

        // Send Request To MusicBrainz API
        const sendRequest = function () {
            
            getMusicBrainzReleases(job.data)
            .then(parseReleaseData)
            .then( (musicbrainzReleases) => {
                return updateGrailWithReleases(mixradioRelease, musicbrainzReleases);
            })
            .catch( (result) => {
                return done(null, result);
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


/* Returns a promise to fetch MusicBrainz release data */
const getMusicBrainzReleases = (data) => {
    
    if (data.mb_release_id) {
        return getReleaseById(data.mb_release_id);
    }

    return getReleaseByName(data.mr_release_name, data.mr_artist_name);
}


/* Parse Musicbrainz Release(s) into an Array of releases  */
const parseReleaseData = (releaseData) => {

    if (!releaseData) {
        return Promise.reject(null);
    }
    
    if (releaseData.constructor === Array) {
        return Promise.resolve(releaseData);
    }

    if (releaseData.constructor == Object) {
        return Promise.resolve([releaseData]);
    }

    return Promise.reject(new Error("MusicBrainz Release Data: Incorrect Data Type. Must be Array or Object"));
}


/* Sequentially update Grail with returned MusicBrainz Releases */
const updateGrailWithReleases = (mr_release, musicbrainz_releases) => {

    let promise = Promise.resolve();

    _.each(musicbrainz_releases, (mb_release) => {

        promise = promise.then( () => {
            return updateGrailWithRelease(mr_release, mb_release)
        });

    });

    return promise;
}


const updateGrailWithRelease = (mr_release, mb_release) => {
    
    // Start database transaction
    return db.transaction( (trx) => {

        const releasePromise = findAndUpdateOrCreateMusicBrainzRelease(mr_release, mb_release, trx);
        const artistPromise = findAndUpdateOrCreateMusicBrainzArtist(mr_release, mb_release, trx);

        return Promise.all([releasePromise, artistPromise])
            .then( ([grail_release_ids, grail_artist_ids]) => {
                const mr_track_ids = _.map(mr_release.tracks, "id");
                return insertTrackIntoGrail(grail_release_ids, grail_artist_ids, mr_track_ids, trx);
            });
    });   
}


//////////////////////////////////////////////////////////////////////////////////////////
// Helpers: API Promise Wrappers
//////////////////////////////////////////////////////////////////////////////////////////

// Promise Wrapper For MusicBrainz Artist Release Cardinality API
// Returns a single MusicBrainz Release Object
const getReleaseById = (id) => {
    
    return new Promise( (resolve, reject) => {

        MusicBrainz.Release.getById(id, (err, release) => {

            if (err) {
                return reject(err);
            }

            return resolve(release);
        });
    });
}


// Promise Wrapper For MusicBrainz Artist Name API
// Returns multiple MusicBrainz Release Objects
const getReleaseByName = (releaseName, artistName) => {
    
    return MusicBrainz.Release.getByName(releaseName, artistName, (err, releases) => {

        if (err) {
            return reject(err);
        }

        if (!releases) {
            return reject(null);
        }

        // Map MusicBrainz Release Objects to Promises for RealeaseById Requests
        const releasePromises = _.map(releases, (release) => {
            return getReleaseById(release.id);
        });

        return Promise.all(releasePromises);
    });
}


//////////////////////////////////////////////////////////////////////////////////////////
// Release: Check / Update / Insert
//////////////////////////////////////////////////////////////////////////////////////////

const findAndUpdateOrCreateMusicBrainzRelease = (mr_release, mb_release, trx) => {

    const releaseCriteria = ReleaseCriteriaMatch(mr_release, mb_release);

    const queryParams = {
        grail_table: "grail_release",
        grail_table_unique_attribute: "grail_release_id",
        grail_constraint_attribute: "mixradio_release_id",
        grail_constraint_value: mr_release.id,
        new_attributes: {
            musicbrainz_release_id: mb_release.id,
            musicbrainz_release_criteria: JSON.stringify(releaseCriteria)
        },
        find_constraint_attribute: "musicbrainz_release_id",
        find_constraint_value: mb_release.id,
        insert_constraint_distinct_columns: [
            "spotify_release_id", "spotify_release_criteria",
            "mixradio_release_id", "mixradio_release_name", "mixradio_release_cardinality"
        ]
    };

    return QueryHelper.findAndUpdateorCreateGrailEntity(queryParams, trx);
}


//////////////////////////////////////////////////////////////////////////////////////////
// Artist: Check / Update / Insert
//////////////////////////////////////////////////////////////////////////////////////////

const findAndUpdateOrCreateMusicBrainzArtist = (mr_release, mb_release, trx) => {

    const queryParams = {
        grail_table: "grail_artist",
        grail_table_unique_attribute: "grail_artist_id",
        grail_constraint_attribute: "mixradio_artist_id",
        grail_constraint_value: mr_release.artist_id,
        new_attributes: { 
            musicbrainz_artist_id: mb_release.artist_id
        },
        find_constraint_attribute: "musicbrainz_artist_id",
        find_constraint_value: mb_release.artist_id,
        insert_constraint_distinct_columns: [
            "spotify_artist_id",
            "spotify_artist_name",
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
            "mixradio_artist_id",
            "mixradio_artist_name",
            "mixradio_artist_cardinality"
        ]
    };

    return QueryHelper.findAndUpdateorCreateGrailEntity(queryParams, trx);
}


//////////////////////////////////////////////////////////////////////////////////////////
// Track: Insert
//////////////////////////////////////////////////////////////////////////////////////////

/*  
    If a new artist or release inserted, we must insert into Grail Track with the new grail ids for artist, and release
    for all tracks with the original mixradio_release_id used to crawl.

    @param { string } grail_release_ids - Grail Release IDs of inserted Releases
    @param { string } grail_artist_ids - Grail Artist IDs of inserted Artists
    @param { string } mr_track_ids - MixRadio Track ID related to new Release and Artist inserts
*/
const insertTrackIntoGrail = (grail_release_ids, grail_artist_ids, mr_track_ids, trx) => {

    // Create Unique Release Artist Pairs
    let artistReleaseIdPairs = [];
    _.each(grail_release_ids, (grail_release_id) => {
        _.each(grail_artist_ids, (grail_artist_id) => {
            artistReleaseIdPairs.push({ grail_release_id, grail_artist_id });
        });
    });

    // Distinct Columns To Copy From Grail Track When Inserting A New Track
    const distinctTrackColumns = [
        "isrc",
        "spotify_track_id",
        "spotify_track_name",
        "spotify_track_criteria",
        "musicbrainz_track_id",
        "echonest_track_id",
        "lyricfind_US_track_id",
        "musixmatch_track_id",
        "mixradio_track_id",
        "mixradio_track_name",
        "mixradio_track_position",
        "msd_track_id"
    ]

    return trx("grail_track")
        .distinct(distinctTrackColumns)
        .whereIn('mixradio_track_id', mr_track_ids)
        .then( (distinctTracks) => {

            let insertTracks = [];
            _.each(distinctTracks, (track) => {
                _.each(artistReleaseIdPairs, (idPair) => {
                    insertTracks.push(_.merge(track, idPair));
                });
            });

            return insertTracks;
        })
        .then( (newTracks) => {
            const chunkSize = newTracks.length;
            return trx.batchInsert('grail_track', newTracks, chunkSize);
        });
}