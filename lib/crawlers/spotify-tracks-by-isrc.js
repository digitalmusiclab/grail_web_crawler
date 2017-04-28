'use strict';

// Load dependencies
const LineReader = require('line-by-line');
const Dispatch = require('./../dispatch');
const Logger = require('./../logger');

// Open the file from the options for reading
const options = require('./../../config/options.config');
const reader = new LineReader(options['data-file']);

let currentJobCount = 0;

// On every new line of the data file create a new crawl job
reader.on('line', isrc => {
  // Create a new job to crawl given an isrc
  Dispatch.dispatchCrawlJob({ namespace: 'spotify:trackByIsrc', id: isrc });

  // Log every 10k jobs so we know this process is still in the land of the living
  currentJobCount++;
  if (currentJobCount % 10000 === 0) {
    Logger.info('crawlSeeder.line: currently created %d jobs', currentJobCount);
  }
});

// There was an error parsing the file, log the error and exit
reader.on('error', error => {
  Logger.error('crawlSeeder.error: ', error);
  process.exit(1);
});

// All jobs were created, we are done
reader.on('end', () => {
  Logger.info('crawlSeeder.end: created all jobs');
  Logger.info('crawlSeeder.end: created %d total jobs', currentJobCount);
});
