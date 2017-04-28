'use strict';

// Load dependencies
const Logger = require('../lib/Logger.js');
const MusicBrainzAlbum = require('./../wrappers/music-brainz/album');

// Load RateLimiter for Spotify API
const musicBrainz = require('./../wrappers/music-brainz/api');
const rateLimiter = require('./../lib/RateLimiter').MusicBrainz;

/**
 * Queries the Music Brains API for album metadata given the name of the artist
 * according to Spotify and the name of the album.  Stores the relevant metadata
 * that was returned to the database.
 * 
 * @param {object} job - Metadata from the job that is being processed
 * @param {object} job.data - The parameters that were passed to the job
 * @param {string} job.data.spotifyArtist - The name of the artist on Spotify
 * @param {string} job.data.spotifyAlbum - The name of the album on Spotify
 * @param {function} done - Called with an error if one occurs
 */
exports.releaseBySpotifyArtistAndAlbum = function releaseBySpotifyArtistAndAlbum(job, done) {
  rateLimiter(process.pid, (error, timeLeft) => {
    // Rate limiter reported an error, exit immediately
    if (error) {
      return done(error);
    }

    // Respect the rate limit before making the request
    const time = Number.parseInt(timeLeft, 10);
    const sleepTime = Math.max(time, 0);

    return setTimeout(() => {
      musicBrainz.getAlbumByArtistAndName(
        job.data.spotifyArtist,
        job.data.spotifyAlbum,
        (error, albums) => {
          // Unable to retrieve the metadata (could be rate limit)
          if (error) {
            Logger.info('music-brainz.releaseBySpotifyArtistAndAlbum: failed', error);
            return done(error);
          }

          // There is no metadata, we are done
          if (!albums) {
            return done();
          }

          // For each album, serialize into a `MusicBrainzAlbum` and log
          for (const metadata of albums) {
            const album = new MusicBrainzAlbum({
              spotifyAlbumName: job.data.spotifyAlbum,
              spotifyArtistName: job.data.spotifyArtist,
              metadata
            });

            Logger.info('music-brainz.releaseBySpotifyArtistAndAlbum: album returned', album);
          }

          return done();
        }
      );
    }, sleepTime);
  });
};
