'use strict';

// Load dependencies
const Dispatch = require('./../dispatch');
const LineReader = require('line-by-line');
const Logger = require('./../logger');

// Open the file from the options for reading
const options = require('./../../config/options.config');
const reader = new LineReader(options['data-file']);

let currentJobCount = 0;

// Parse each album separately and dispatch a crawl job
reader.on('line', spotifyAlbum => {
  currentJobCount = currentJobCount + 1;
  const albumData = spotifyAlbum.split('\t');
  const [albumName, artistName] = albumData;

  // Dispatch job to hit Music Brainz for album metadata
  Dispatch.dispatchCrawlJob({
    namespace: 'mb:releaseBySpotifyArtistAndAlbum',
    data: {
      spotifyArtist: artistName,
      spotifyAlbum: albumName
    }
  });

  // Log progress every `250` requests (because Music Brainz has a low rate limit)
  if (currentJobCount % 250 === 0) {
    Logger.info('Rows completed: %d', currentJobCount);
  }
});

// There was an issue reading the data file, exit with an error
reader.on('error', error => {
  Logger.error('crawlMusicBrainzAlbum.error: ', error);
  process.exit(1);
});

// Done reading the data file, let the
reader.on('end', () => {
  shutdownProcedure();
});

/**
 * Logs that the crawl jobs have all been added to the job queue.
 * 
 * @return {void}
 */
function shutdownProcedure() {
  Logger.info('crawlMusicBrainzAlbum.end: created all jobs');
  Logger.info('crawlMusicBrainzAlbum.end: created %d total jobs', currentJobCount);
}
