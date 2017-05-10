'use strict';

// Load dependencies
const Logger = require('../lib/logger');
const MusicBrainzApi = require('./../wrappers/musicbrainz/api');
const RateLimiter = require('./../lib/rate-limiter').MusicBrainz;


exports = module.exports = function process(job, done) {
    
    RateLimiter(process.pid, (error, timeLeft) => {

        // Rate limiter reported an error, exit immediately
        if (error) {
            return done(error);
        }

        // Request Completion Handler
        const requestCompletionHandler = function (error, data) {

            // Unable to retrieve the metadata (could be rate limit)
            if (error) {
                Logger.info('musicbrainz.artist: failed', error);
                return done(error);
            }

            // There is no metadata, we are done
            if (!data) {
                return done();
            }

            // Serialize metadata into a `MusicBrainzRelease` and log
            // const album = new MusicBrainzRelease(data);
            Logger.info('musicbrainz.artist: ', data);

            return done();
        }


        // Send Request To MusicBrainz API
        const sendRequest = function () {
            MusicBrainzApi.Artist.getById(job.data.id, requestCompletionHandler);
        }


        // Respect the rate limit before making the request
        const time = Number.parseInt(timeLeft, 10);
        const sleepTime = Math.max(time, 0);

        return setTimeout(sendRequest, sleepTime);
    });
};