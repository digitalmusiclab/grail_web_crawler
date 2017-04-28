'use strict';

// Load dependencies
const cluster = require('cluster');
const cpuTotal = require('os').cpus().length;

if (cluster.isMaster) {
  // For each core fork a child process
  for (let cpu = 0; cpu < cpuTotal; cpu++) {
    cluster.fork();
  }
  require('./master');
} else {
  require('./worker');
}
