'use strict';

// Load dependencies
const Winston = require('winston');

Winston.default.transports.console.colorize = true;
exports = module.exports = Winston;
