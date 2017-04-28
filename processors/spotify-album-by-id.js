'use strict';

// Load dependencies
const Logger = require('../lib/logger');

// Load the Spotify wrapper and rate limiter
const spotify = require('./../wrappers/spotify/api');
const SpotifyRateLimiter = require('../lib/rate-limiter').Spotify;

/**
 * Queries for a Spotify album from the API given a Spotify identifier.
 * 
 * @param {object} job - The job that was contains all of the required data
 * @param {string} job.data.id - The identifier to query for the album with
 * @param {function} done - Called when done or if there is an error
 * 
 * @return {void}
 */
exports = module.exports = function albumBySpotifyAlbumId(job, done) {
  SpotifyRateLimiter(process.pid, (error, timeleft) => {
    // The rate limiter reported an error, end the job
    if (error) {
      return done(error);
    }

    // Check how long we have to wait according to the rate limiter
    const time = parseInt(timeleft, 10);
    const sleepTime = Math.max(time, 0);

    return setTimeout(() => {
      spotify.getAlbumById(job.data.id, (error, album) => {
        // Spotify returned an error, return it
        if (error) {
          return done(error);
        }

        // There is no album information
        if (!album) {
          return done();
        }

        // TODO: Write to wherever this data is needed.  We no longer write to a
        // secondary database so this data needs a home.
        Logger.info('spotify.albumBySpotifyAlbumId: album returned', album);

        return done();
      });
    }, sleepTime);
  });
};
