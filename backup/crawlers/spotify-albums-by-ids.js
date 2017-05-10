'use strict';

// Load dependencies
const LineReader = require('line-by-line');
const Dispatch = require('./../dispatch');
const Logger = require('./../logger');

// Load the data file and initialize the reader
const options = require('./../../config/options.config');
const reader = new LineReader(options['data-file']);

let currentJobCount = 0;
let currentLineCount = 0;
let currentBatch = [];

// When a new line is read, add it to the batch and execute the batch if it is
// ready to be executed.
reader.on('line', spotifyAlbumId => {
  // Add the line to the current batch
  currentLineCount++;
  currentBatch.push(spotifyAlbumId);

  // If the batch is ready to send, send the batch to the crawler
  if (currentBatch.length === 20) {
    sendBatchAlbumCrawlRequest();
  }

  // Log the current number of rows that have been parsed
  if (currentLineCount % 10000 === 0) {
    Logger.info('Rows completed: %d', currentLineCount);
  }
});

// When there is an error reading the line, exit with an error
reader.on('error', error => {
  Logger.error('crawlSpotifyAlbum.error: ', error);
  process.exit(1);
});

// When we reach the end of the file initiate the shutdown procedure
reader.on('end', () => {
  if (currentBatch.length) {
    sendBatchAlbumCrawlRequest();
  }
  shutdownProcedure();
});

/**
 * Logs that the crawl jobs have all been added to the job queue.
 * 
 * @return {void}
 */
function shutdownProcedure() {
  Logger.info('crawlSpotifyAlbum.end: created all jobs');
  Logger.info('crawlSpotifyAlbum.end: created %d total jobs', currentJobCount);
}

/**
 * Creates a job in the job queue with a batch of albums to send to the Spotify
 * API.  Clears out the batch after the job is created.
 * 
 * @return {void}
 */
function sendBatchAlbumCrawlRequest() {
  currentJobCount++;
  Dispatch.dispatchCrawlJob({
    ids: currentBatch,
    namespace: 'spotify:albumsBySpotifyAlbumIds'
  });
  currentBatch = [];
}
