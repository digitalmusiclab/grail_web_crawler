'use strict';

// Load dependencies
const secrets = require('./config/secrets');
const kueConfiguration = secrets[process.env.NODE_ENV || 'development'].queue.kue;

const Logger = require('./lib/Logger.js');
let completedJobs = 0;

Logger.info('Master process loaded');

// Load job queue
const kue = require('kue');
const Queue = kue.createQueue(kueConfiguration);

// Load job queue web interface
kue.app.set('title', 'Spotify Crawler Dashboard');
kue.app.listen(process.env.KUE_PORT || 3000);

// Thread shutdown procedure
function shutdownProcedure(signal) {
  Logger.info('Queue shutting down');
  Queue.shutdown(5000, function onShutdown(error) {
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
Queue.on('job complete', function jobComplete(id, result) {
  Logger.info('Completed job: %d, Total completed: %d', id, ++completedJobs);
});

Queue.on('job failed', function jobFailed(id, result) {
  Logger.error('Job: ', id, ' failed with result: ', result);
});

Queue.on('error', function jobError(error) {
  Logger.error('Queue error: ', error);
});
