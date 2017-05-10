'use strict';

// Load dependencies
const Dispatch = require('./../dispatch');
const LineReader = require('line-by-line');
const Logger = require('./../logger');

// Open the file from the options for reading
// const options = require('./../../config/options.config');
const reader = new LineReader("./data/mb_release_manifest2k.tsv");

let currentJobCount = 0;
let currentErrorCount = 0;
let dispatchedJobCount = 0;

// Parse each album separately and dispatch a crawl job
reader.on('line', (line) => {

  currentJobCount = currentJobCount + 1;
  
  const attrs = line.split('\t');
  
  let metadata = null

  try {
    metadata = {
      mr_artist_name: attrs[0],
      mr_artist_id: attrs[1],
      mr_artist_cardinality: attrs[2],
      mr_release_name: attrs[3],
      mr_release_id: attrs[4],
      mr_release_tracks: JSON.parse(attrs[5])
    }
  }
  catch (error) {
    currentErrorCount += 1;
    Logger.error("crawl:musicbrainz:releaseByArtistAndName.error: ", error);
  }

  // Dispatch job to MusicBrainz for Release metadata
  if (metadata) {
    dispatchedJobCount += 1;
    Dispatch.dispatchCrawlJob({
      namespace: 'musicbrainz:releaseByArtistAndName',
      data: metadata
    });
  }


  // Log progress every `250` requests (because Music Brainz has a low rate limit)
  if (currentJobCount % 250 === 0) {
    Logger.info('Rows completed: %d', currentJobCount);
  }
});

// There was an issue reading the data file, exit with an error
reader.on('error', error => {
  Logger.error('crawl:musicbrainz:releaseByArtistAndName.error: ', error);
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
  console.log(currentJobCount, dispatchedJobCount, currentErrorCount);
  Logger.info('crawl:musicbrainz:releaseByArtistAndName.end: created all jobs');
  Logger.info('crawl:musicbrainz:releaseByArtistAndName.end: created %d total jobs', currentJobCount);
}
