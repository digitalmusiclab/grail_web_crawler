'use strict';

// Load dependencies
const Logger = require('../lib/logger');
const MusicBrainzRelease = require('./../wrappers/music-brainz/release');

// Load RateLimiter for Spotify API
const musicBrainz = require('./../wrappers/music-brainz/api');
const rateLimiter = require('./../lib/rate-limiter').MusicBrainz;

/**
 * Searches the MusicBrainz API for releases given the name of the artist
 * and the name of the release. Uses the result to spawn new Job(s) to fetch
 * release level metadata for each release that is found.
 *
 * 
 * @param {object} job - Metadata from the job that is being processed
 * @param {object} job.data - The parameters that were passed to the job
 * @param {string} job.data.artistName - The name of the artist to search
 * @param {string} job.data.releaseName - The name of the release to search
 * @param {function} done - Called with an error if one occurs
 */
exports = module.exports = function releaseByArtistAndName(job, done) {
  
  rateLimiter(process.pid, (error, timeLeft) => {
    
    // Rate limiter reported an error, exit immediately
    if (error) {
      return done(error);
    }

    // Respect the rate limit before making the request
    const time = Number.parseInt(timeLeft, 10);
    const sleepTime = Math.max(time, 0);

    const { artistName, releaseName } = job.data;


    return setTimeout(() => {
      
      // Request data from API
      musicBrainz.getReleaseByArtistAndName(artistName, releaseName, (error, releases) => {
          
          // Unable to retrieve the metadata (could be rate limit)
          if (error) {
            Logger.info('musicbrainz.releaseByArtistAndName: failed', error);
            return done(error);
          }

          // There is no metadata, we are done
          if (!releases) {
            return done();
          }

          // For each album, serialize into a `MusicBrainzRelease` and log
          for (const metadata of releases) {
            const release = { id: metadata.id, name: metadata.title }
            Logger.info('musicbrainz.releaseByArtistAndName: release found', release);
          }

          return done();
        }

      );
      
    }, sleepTime);

  });
};
