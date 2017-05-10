'use strict';

// Load dependencies
require("./lib/root-require")();
const Logger = rootRequire('lib/logger');
const secrets = rootRequire('config/secrets');
const kueConfiguration = secrets[process.env.NODE_ENV || 'development'].queue.kue;


let completedJobs = 0;
Logger.info('Master process loaded');


// Load job queue
const kue = require('kue');
const Queue = kue.createQueue(kueConfiguration);


// Load job queue web interface
kue.app.set('title', 'Spotify Crawler Dashboard');
kue.app.listen(process.env.KUE_PORT || 3000);


// Thread shutdown procedure
function shutdownProcedure() {
  Logger.info('Queue shutting down');
  Queue.shutdown(5000, (error) => {
    if (error) {
      Logger.error('Queue shutdown error: ', error);
    }
    process.exit(0);
  });
}


// Process failure events
process.on('SIGTERM', shutdownProcedure);
process.on('SIGINT', shutdownProcedure);


// Log queue level events
Queue.on('job complete', (id) => {
  Logger.info('Completed job: %d, Total completed: %d', id, ++completedJobs);
});

Queue.on('job failed', (id, result) => {
  Logger.error('Job: ', id, ' failed with result: ', result);
});

Queue.on('error', (error) => {
  Logger.error('Queue error: ', error);
});


// // Master is setup and ready to go, parse the options for the crawl job to do
// const options = require('./config/options.config');
// require(options.crawler);