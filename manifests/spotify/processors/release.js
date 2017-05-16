'use strict';

// Load dependencies
const Logger = rootRequire('lib/logger');
const SpotifyApi = require('./../api');
const RateLimiter = rootRequire('lib/rate-limiter').Spotify;
const MixRadioRelease = rootRequire('manifests/mixradio/models').Release;
const ReleaseCriteriaMatch = rootRequire("criteria/release");
const db = rootRequire("lib/database");
const _ = require("lodash");


/*
    Job Data = {
        sp_realease_id: "123abc",
        mr_release_id: "abc_easy_as_123",
        mr_release_name: "12345",
        mr_release_cardinality: 12,
        mr_release_tracks: [{
            "mr_track_id": "12342", 
            "mr_track_name": "Sabotage",
            "mr_track_position": "5"
        }]
    }
*/
exports = module.exports = function process(job, done) {

    const { sp_realease_id } = job.data;

    const mr_release = new MixRadioRelease(job.data);


    RateLimiter(process.pid, (error, timeLeft) => {

        if (error) {
            return done(error);
        }

        const sendRequest = function () {

            SpotifyApi.Release.getById(sp_realease_id)
            .then( (sp_release) => {
                return updateGrailRelease(mr_release, sp_release);
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

    const criteriaJson = ReleaseCriteriaMatch(mr_release, sp_release);

    const spotify_release_criteria = JSON.stringify(criteriaJson);

    return knex("grail_release")
        .where('mixradio_release_id', mr_release.id)
        .andWhere('spotify_release_id', sp_release.id)
        .update({ spotify_release_criteria });
} 