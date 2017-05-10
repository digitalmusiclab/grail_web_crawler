'use strict';

// Load dependencies
const Logger = require('../lib/logger');
const MusicBrainzRelease = require('./../wrappers/music-brainz/release');

// Load RateLimiter for Spotify API
const musicBrainz = require('./../wrappers/music-brainz/api');
const rateLimiter = require('./../lib/rate-limiter').MusicBrainz;

/**
 * Queries the Music Brains API for release metadata given a MusicBrainz
 * Release ID. Stores the relevant metadata that was returned to the database.
 * 
 * @param {object} job - Metadata from the job that is being processed
 * @param {object} job.data - The parameters that were passed to the job
 * @param {string} job.data.id - MusicBrainz Release Identifier
 * @param {function} done - Called with an error if one occurs
 */
exports = module.exports = function releaseById(job, done) {

  rateLimiter(process.pid, (error, timeLeft) => {

    // Rate limiter reported an error, exit immediately
    if (error) {
      return done(error);
    }

    // Respect the rate limit before making the request
    const time = Number.parseInt(timeLeft, 10);
    const sleepTime = Math.max(time, 0);


    return setTimeout(() => {
      
      // Request data from API
      musicBrainz.getReleaseById(job.data.id, (error, release_metadata) => {
          
          // Unable to retrieve the metadata (could be rate limit)
          if (error) {
            Logger.info('musicbrainz.releaseById: failed', error);
            return done(error);
          }

          // There is no metadata, we are done
          if (!release_metadata) {
            return done();
          }

          // Serialize metadata into a `MusicBrainzRelease` and log
          const album = new MusicBrainzRelease(release_metadata);
          Logger.info('musicbrainz.releaseById: release returned', album);

          return done();
        }
      );
    }, sleepTime);
  });
};
