'use strict';

/* Load Environment Variables */
require("dotenv-safe").config({
    path: `./config/.env.${process.env.NODE_ENV || 'development'}`,
    sample: "./config/.env.requirements",
    silent: true
});

// Load dependencies
require("./lib/root-require")();
const commandLineArguments = require('command-line-args');
const Dispatch = rootRequire('lib/dispatch');
const LineReader = require('line-by-line');
const Logger = rootRequire('lib/logger');
const fs = require('fs');


/*
    seeder.js

    Seeder will seed the job queue from a TSV seed file
    using the loader for a specified namespace and entity.

    @arg{ String } namespace - the namespace to load
    @arg{ String } entity - the entity level to load
    @arg{ String } data - path to seed data
*/


// Command Line Options
const options = commandLineArguments([
    { name: 'namespace', type: String },
    { name: 'entity', type: String },
    { name: 'data', type: String }
]);

// Validate that a namespace arugment exists
if (!options.namespace) {
    throw new Error("options: namespace argument required");
}

// Validate that a namespace arugment exists
if (!options.entity) {
    throw new Error("options: entity argument required");
}

// Validate that seed arugment exists
if (!options.data) {
    throw new Error("options: seed argument required");
}

// Validate that the data file exists
if (!fs.existsSync(options.data)) {
    throw new Error('options: seed file not found');
}

const { namespace, entity } = options;

// Locate the seed loader to use
const loaderPath = `./manifests/${namespace}/loaders/${entity}.js`;

// Validate that the seed loader file exists
if (!fs.existsSync(loaderPath)) {
    throw new Error(`options: seed loader not found`);
}

// Seed Loader that reads lines
const loader = require(loaderPath);

// Job Seed Counts
let totalJobCount = 0;
let errorJobCount = 0;
let dispatchedJobCount = 0;

// File Reader
const reader = new LineReader(options.data, { 
    encoding: 'utf8',
    skipEmptyLines: true
});


// Parse each album separately and dispatch a crawl job
reader.on('line', (line) => {

    // Increment Total Job Count
    totalJobCount += 1;

    let jobMetadata = null;
    
    try {
        jobMetadata = loader.lineParser(line);
    } 
    catch (error) {
        // Logger.error('seeder.line.error: ', error);
        errorJobCount += 1;
        return;
    }

    // Dispatch Single Job
    if (jobMetadata.constructor === Object) {
        Dispatch.dispatchCrawlJob(jobMetadata);
        dispatchedJobCount += 1;
    }
    
    // Dispatch Multiple Jobs
    if (jobMetadata.constructor === Array) {
        jobMetadata.forEach(Dispatch.dispatchCrawlJob);
        dispatchedJobCount += jobMetadata.length;
    }

    // Print summary every 10k lines
    if (totalJobCount % 10000 === 0) {
        Logger.info('----------------------------------------');
        Logger.info('seeder.report: Shutdown Report');
        Logger.info('seeder.report: %d Jobs Read', totalJobCount);
        Logger.info('seeder.report: %d Jobs With Parsing Errors', errorJobCount);
        Logger.info('seeder.report: %d Jobs Dispatched', dispatchedJobCount);
        Logger.info('----------------------------------------');
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
    process.exit(0);
});