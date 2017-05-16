'use strict';

/* Load Environment Variables */
require("dotenv-safe").config({
    path: `./config/.env.${process.env.NODE_ENV || 'development'}`,
    sample: "./config/.env.requirements",
    silent: true
});

// Load dependencies
require("./lib/root-require")();
const Logger = rootRequire('lib/logger');
const config = rootRequire('config');

let completedJobs = 0;
Logger.info('Master process loaded');


// Load job queue
const kue = require('kue');
const Queue = kue.createQueue(config.JobQueue);


// Load job queue web interface
kue.app.set('title', 'Grail Crawler Dashboard');
kue.app.listen(config.Dashboard.port);


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