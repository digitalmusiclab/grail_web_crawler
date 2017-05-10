'use strict';

// Load dependencies
const Logger = require('../lib/logger');

// Load the Spotify wrapper and rate limiter
const spotify = require('./../wrappers/spotify/api');
const SpotifyRateLimiter = require('../lib/rate-limiter').Spotify;

/**
 * Queries for Spotify albums from the API given a list of Spotify identifiers.
 * 
 * @param {object} job - The job that was contains all of the required data
 * @param {string[]} job.data.ids - The identifiers to query for the albums with
 * @param {function} done - Called when done or if there is an error
 * 
 * @return {void}
 */
exports = module.exports = function albumsBySpotifyAlbumIds(job, done) {
  SpotifyRateLimiter(process.pid, (error, timeleft) => {
    // The rate limiter reported an error, end the job
    if (error) {
      return done(error);
    }

    const spotifyAlbumIds = job.data.ids;

    // Check how long we have to wait according to the rate limiter
    const time = parseInt(timeleft, 10);
    const sleepTime = Math.max(time, 0);

    return setTimeout(() => {
      spotify.getAlbumsByIds(spotifyAlbumIds, (error, albums) => {
        // Spotify returned an error, return it
        if (error) {
          return done(error);
        }

        // There is no album information
        if (!albums) {
          return done();
        }

        // TODO: Write to wherever this data is needed.  We no longer write to a
        // secondary database so this data needs a home.
        for (const album of albums) {
          Logger.info('spotify.albumsBySpotifyAlbumIds: album returned', album);
        }

        return done();
      });
    }, sleepTime);
  });
};
