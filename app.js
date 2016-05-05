var cluster = require('cluster');
var numCPUs = require('os').cpus().length;

// Load Master Process
if (cluster.isMaster) {

	for (var i = 0; i < numCPUs; i++) {
        cluster.fork();
    }

    require("./master.js")
}
// Load Worker Process
else {
	require("./worker.js");
}