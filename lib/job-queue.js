'use strict';

// Load dependencies
const secrets = require('./../config/secrets');
const kue = require('kue');

// Configure Kue Job Queue
const kueConfiguration = secrets[process.env.NODE_ENV || 'development'].queue.kue;
const Queue = kue.createQueue(kueConfiguration);

exports = module.exports = Queue;