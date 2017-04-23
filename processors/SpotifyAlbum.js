'use strict';

// Load dependencies
const Logger = require('../lib/Logger.js');

// Load the Spotify wrapper and rate limiter
const spotify = require('./../wrappers/spotify/api');
const SpotifyRateLimiter = require('../lib/RateLimiter').Spotify;

exports.albumsBySpotifyAlbumIds = (job, done) => {
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

exports.albumBySpotifyAlbumId = (job, done) => {
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
