'use strict';

// Load dependencies
const Logger = require('../lib/Logger.js');

// Load Spotify API wrapper and rate limiter
const spotify = require('./../wrappers/spotify/api');
const SpotifyRateLimiter = require('../lib/RateLimiter').Spotify;

/**
 * Queries for a Spotify track from the API given an ISRC.
 * 
 * @param {object} job - The job that was contains all of the required data
 * @param {string} job.data.isrc - The ISRC to query for the track with
 * @param {function} done - Called when done or if there is an error
 * 
 * @return {void}
 */
exports.trackByIsrc = function trackByIsrc(job, done) {
  // Ask rate limiter for time left before a request can be made
  SpotifyRateLimiter(process.pid, (error, timeleft) => {
    // If rate limiter reports an error, invoke callback with error
    if (error) {
      return done(error);
    }

    // Make sure that the ISRC is stored in the job metadata
    const isrc = job.data.isrc;
    if (typeof isrc !== 'string') {
      return done('spotify.trackByIsrc: no isrc provided');
    }

    // Parse time left returned by rate limiter
    const time = Number.parseInt(timeleft, 10);
    const sleepTime = Math.max(time, 0);

    // Timeout execution until request can be made
    return setTimeout(() => {
      spotify.getTracksByIsrc(isrc, (error, tracks) => {
        // If the API responds with an error, fail the job
        if (error) {
          return done(error);
        }

        // No tracks were returned.  This is okay, just indicate we are done.
        if (!tracks) {
          return done();
        }

        // TODO: Write to wherever this data is needed.  We no longer write to a
        // secondary database so this data needs a home.
        for (const track of tracks) {
          Logger.info('spotify.trackByIsrc: track returned', track);
        }

        return done();
      });
    }, sleepTime);
  });
};
