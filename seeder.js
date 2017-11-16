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
let lineCount = 0;
let errorJobCount = 0;
let dispatchedJobCount = 0;

const printSeederSummary = () => {
    Logger.info('----------------------------------------');
    Logger.info('seeder.report: Seeder Summary');
    Logger.info('seeder.report: %d Lines Read', lineCount);
    Logger.info('seeder.report: %d Jobs With Errors', errorJobCount);
    Logger.info('seeder.report: %d Jobs Dispatched', dispatchedJobCount);
    Logger.info('----------------------------------------');
};

// File Reader
const reader = new LineReader(options.data, {
    encoding: 'utf8',
    skipEmptyLines: true
});


// Parse each album separately and dispatch a crawl job
reader.on('line', (line) => {

    // Pause line reader while parsing the line
    reader.pause();

    // Increment Total Job Count
    lineCount += 1;

    let jobMetadata = null;

    try {
        jobMetadata = loader.lineParser(line);
    }
    catch (error) {
        // Logger.error('seeder.line.error: ', error);
        errorJobCount += 1;
        reader.resume();
        return;
    }

    // LineParser says we should skip some lines
    // indicating some data is missing from seed
    if (jobMetadata === undefined) {
        errorJobCount += 1;
        reader.resume();
        return;
    }

    // Dispatch job metadata to the job queue
    Promise.resolve()
    .then( () => {

        // Dispatch Single Job
        if (jobMetadata.constructor === Object) {
            return Promise.all([Dispatch.dispatchCrawlJobPromise(jobMetadata)]);
        }

        // Dispatch Multiple Jobs
        if (jobMetadata.constructor === Array) {
            return Promise.all(_.map(jobMetadata, Dispatch.dispatchCrawlJobPromise));
        }

        // Default case, returns an empty array
        return Promise.resolve([]);
    })
    .then( (dispatchedJobIds) => {
        dispatchedJobCount += dispatchedJobIds.length;
    })
    .catch( (error) => {
        Logger.error('seeder.dispatch.error: ', error);
    })
    .then( () => {

        // Print summary every 10k lines
        if (lineCount % 10000 === 0) {
            printSeederSummary();
        }

	// End seed after 4 jobs successfully loaded
      	if (dispatchedJobCount === 4) {
      		printSeederSummary();
      		process.exit(0);
      	}

        // Resume reading lines
        reader.resume();
    });
});

// Problem reading the data file, exit with an error
reader.on('error', (error) => {
    Logger.error('seeder.file.error: ', error);
    process.exit(1);
});

// Finished reading seed file, print summary.
reader.on('end', () => {
    printSeederSummary();
    process.exit(0);
});
