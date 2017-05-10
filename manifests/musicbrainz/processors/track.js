'use strict';

// Load dependencies
const Logger = rootRequire('lib/logger');
const MusicBrainzApi = require('./../api');
const RateLimiter = rootRequire('lib/rate-limiter').MusicBrainz;
const db = rootRequire("lib/database");
const _ = require("lodash");


/*
    MusicBrainz Track Crawl Seeder

    Executes seeder query and dispatches crawl jobs to the job queue. 
    Job processors will use MusicBrainz Track ID or MusicBrainz Release
    ID or MixRadio Track and Release and Artist Name to query the 
    MusicBrainz Track API.

    Job Data = {
        "mr_track_id": "1321427"
        "position":"1",
        "mr_track_name":"I`d Like To Know",
        "mr_artist_name":"Remember Me Soundtrack",
        "mr_release_name":"I Should Coco",
        "mb_track_id":"NULL",
        "mb_release_id":"NULL"
    }
*/


exports = module.exports = function process(job, done) {


    const { mr_track_id, mr_track_name, mr_artist_name, mb_track_id } = job.data;

    
    RateLimiter(process.pid, (error, timeLeft) => {

        // Rate limiter reported an error, exit immediately
        if (error) {
            return done(error);
        }

        // Send Request To MusicBrainz API
        const sendRequest = function () {

            MusicBrainzApi.Track.getByName(mr_track_name, mr_artist_name, function (error, musicbrainzTracks) {

                // Unable to retrieve the metadata (could be rate limit)
                if (error) {
                    Logger.info('musicbrainz.track: failed', error);
                    return done(error);
                }

                // No tracks, so we are done
                if (!musicbrainzTracks) {
                    return done();
                }

                updateGrailWithTracks(mr_track_id, musicbrainzTracks, done)
                    .then( () => {
                        return done(null);
                    })
                    .catch( (error) => {
                        return done(error)
                    });
            });
        }


        // Respect the rate limit before making the request
        const time = Number.parseInt(timeLeft, 10);
        const sleepTime = Math.max(time, 0);

        return setTimeout(sendRequest, sleepTime);
    });
};


const updateGrailWithTracks = (mr_track_id, tracks, callback) => {

    let promise = Promise.resolve();

    _.each(tracks, (track) => {

        promise = promise.then(() => {
            return updateGrailTrack(mr_track_id, track);
        });
    });

    return promise;
}


const updateGrailTrack = (mr_track_id, track) => {

    const criteria = track.criteriaScore();

    return checkTrackCount(mr_track_id, track.id)
        .then( (trackCount) => {

            if (trackCount > 0) {
                Logger.info('musicbrainz.track.update: ', track);
                return updateRelease(mr_track_id, track.id, criteria);
            }

            Logger.info('musicbrainz.track.insert: ', track);
            return insertRelease(mr_track_id, track.id, criteria);
        })
}


////////////////////////////////////////////////////////////////////////////////////
// Query Helpers
////////////////////////////////////////////////////////////////////////////////////

const checkTrackCount = (mixradio_track_id, musicbrainz_track_id) => {
    return db('grail_track')
        .whereNot('musicbrainz_track_id', musicbrainz_track_id)
        .whereNotNull('musicbrainz_track_id')
        .where('mixradio_track_id', mixradio_track_id)
        .count("*");
}


const updateRelease = (mixradio_track_id, musicbrainz_track_id, musicbrainz_track_criteria) => {
    return db('grail_track')
        .where("mixradio_track_id", mixradio_track_id)
        .update("musicbrainz_track_id", musicbrainz_track_id)
        .update("musicbrainz_track_criteria2", JSON.stringify(musicbrainz_track_criteria));
}


const insertRelease = (mixradio_track_id, musicbrainz_track_id, musicbrainz_track_criteria) => {

    const criteraJsonString = JSON.stringify(musicbrainz_artist_criteria);

    const sql = `
    INSERT INTO grail_track(musicbrainz_track_id,musicbrainz_track_criteria2,grail_artist_id,grail_release_id,isrc,spotify_track_id,spotify_track_name,spotify_track_criteria,echonest_track_id,lyricfind_US_track_id,musixmatch_track,mixradio_track_id,mixradio_track_name,mixradio_track_position,msd_track_id,lastfm_track_id,lastfm_track_criteria) 
    SELECT DISTINCT "${musicbrainz_track_id}","${criteraJsonString}",grail_artist_id,grail_release_id,isrc,spotify_track_id,spotify_track_name,spotify_track_criteria,echonest_track_id,lyricfind_US_track_id,musixmatch_track,mixradio_track_id,mixradio_track_name,mixradio_track_position,msd_track_id,lastfm_track_id,lastfm_track_criteria 
    FROM grail.grail_track 
    WHERE mixradio_track_id = "${mixradio_track_id}";
    `
    
    return db.raw(sql);
}