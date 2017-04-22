'use strict';

// Load dependencies
const commandLineArguments = require('command-line-args');

const definitions = [{ name: 'data-file', type: String }];
exports = module.exports = commandLineArguments(definitions);
