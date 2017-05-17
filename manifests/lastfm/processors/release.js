'use strict';

// Load dependencies
const Logger = rootRequire('lib/logger');
const LastFmApi = require('./../api');
const RateLimiter = rootRequire('lib/rate-limiter').LastFm;
const MixRadioRelease = rootRequire('manifests/mixradio/models').Release;
const ReleaseCriteriaMatch = rootRequire("criteria/release");
const QueryHelper = rootRequire("lib/queries");
const db = rootRequire("lib/database");
const _ = require("lodash");


/*
    Job Data (JSON Object)
    ===================================
    mb_realease_id: String,
    mb_artist_id: String
    mr_release_id: String,
    mr_release_name: Integer,
    mr_release_cardinality: Integer,
    mr_release_tracks: [{
        "mr_track_id": Integer,
        "mr_track_name": String,
        "mr_track_position": Integer,
        "mb_track_id": String,
    }]
    ===================================
*/
exports = module.exports = function process(job, done) {

    // Reference MusicBrainz Release IDs
    const { mb_realease_id, mb_artist_id } = job.data;

    // Parse MixRadio Release from Job Data
    const mixradioRelease = new MixRadioRelease(job.data);

    
    RateLimiter(process.pid, (error, timeLeft) => {

        if (error) {
            return done(error);
        }

        const sendRequest = function () {

            LastFmApi.Release.getByMusicBrainzId(job.data.sp_realease_id)
            .then( (spotifyRelease) => {
                return updateGrailRelease(mixradioRelease, spotifyRelease)
            })
            .then( () => {
                return done();
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


const updateGrailRelease = (mr_release, sp_release) => {

    const criteriaJson = CriteriaMatch.criteriaScore(mr_release, sp_release);

    const spotify_release_criteria = JSON.stringify(criteriaJson);

    return knex("grail_release")
        .where('mixradio_release_id', mr_release.id)
        .andWhere('spotify_release_id', sp_release.id)
        .update({ spotify_release_criteria });
} 