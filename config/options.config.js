'use strict';

// Load dependencies
const commandLineArguments = require('command-line-args');
const fs = require('fs');

const definitions = [{ name: 'crawler', type: String }, { name: 'data-file', type: String }];
const options = commandLineArguments(definitions);

// Validate that the crawler file exists
if (!fs.existsSync(options.crawler)) {
  throw new Error('options: crawler not found');
}

// Validate that the data file exists
if (!fs.existsSync(options['data-file'])) {
  throw new Error('options: data file not found');
}

exports = module.exports = options;
