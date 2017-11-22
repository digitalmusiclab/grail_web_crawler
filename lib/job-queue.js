'use strict';

// Load dependencies
const kue = require('kue');
const config = rootRequire('config');

// Configure Kue Job Queue
const Queue = kue.createQueue(config.JobQueue);

// Prevent stuck jobs from unstable Redis connections
Queue.watchStuckJobs(5000);

exports = module.exports = Queue;
