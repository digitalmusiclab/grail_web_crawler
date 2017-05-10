'use strict';

// Load dependencies
require("./lib/root-require")();

const commandLineArguments = require('command-line-args');
const Dispatch = rootRequire('lib/dispatch');
const LineReader = require('line-by-line');
const Logger = rootRequire('lib/logger');
const Manifest = rootRequire('manifests');
const fs = require('fs');

// Command Line Definitions
const options = commandLineArguments([
    { name: 'namespace', type: String },
    { name: 'seed', type: String }
]);


// Validate that a namespace arugment exists
if (!options.namespace) {
    throw new Error("options: namespace argument required");
}

// Validate that seed arugment exists
if (!options.seed) {
    throw new Error("options: seed argument required");
}

// Validate that the data file exists
if (!fs.existsSync(options.seed)) {
    throw new Error('options: seed file not found');
}

const [crawl_api, crawl_entity] = options.namespace.split(":");

const loaderPath = `./manifests/${crawl_api}/loaders/${crawl_entity}.js`

// Validate that the seed loader file exists
if (!fs.existsSync(loaderPath)) {
    throw new Error('options: seed loader not found');
}

// Seed Loader that reads lines
const loader = require(loaderPath);

// Job Seed Counts
let totalJobCount = 0;
let errorJobCount = 0;
let dispatchedJobCount = 0;

// File Reader
const reader = new LineReader(options.seed, { 
    encoding: 'utf8',
    skipEmptyLines: true
});


// Parse each album separately and dispatch a crawl job
reader.on('line', (line) => {

    // Increment Total Job Count
    totalJobCount += 1;

    let jobMetadata = null
    
    try {
        jobMetadata = loader.lineParser(line);
    } 
    catch (error) {
        Logger.error('seeder.line.error: ', error);
        errorJobCount += 1;
        return;
    }
    
    // Dispatch Single Job
    if (typeof jobMetadata == 'object') {
        Dispatch.dispatchCrawlJob(jobMetadata);
        dispatchedJobCount += 1;
    }

    // Dispatch Multiple Jobs
    if (typeof jobMetadata == 'array') {
        jobMetadata.forEach(Dispatch.dispatchCrawlJob);
        dispatchedJobCount += jobMetadata.length;
    }
    
});

// Problem reading the data file, exit with an error
reader.on('error', (error) => {
    Logger.error('seeder.file.error: ', error);
    process.exit(1);
});

// Finished reading seed file, print summary.
reader.on('end', () => {
    Logger.info('seeder.shutdown: Shutdown Summary');
    Logger.info('seeder.shutdown: %d Jobs Read', totalJobCount);
    Logger.info('seeder.shutdown: %d Jobs With Parsing Errors', errorJobCount);
    Logger.info('seeder.shutdown: %d Jobs Dispatched', dispatchedJobCount);
});