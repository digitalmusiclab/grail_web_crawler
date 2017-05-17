'use strict';

// Load dependencies
const Winston = require('winston');

// Configure Logger
Winston.default.transports.console.colorize = true;

exports = module.exports = Winston;
