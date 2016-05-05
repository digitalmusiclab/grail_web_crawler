var Logger 	= require("./lib/Logger.js");
var completed_jobs = 0;

Logger.info("Master Process Loaded");

// Load Crawler Seed
// require("./lib/CrawlSeeder.js");

// Load Job Queue
var kue 	= require("kue");
var Queue 	= kue.createQueue({jobEvents: false});

// Load Job Queue Web Interface
kue.app.set('title', 'Spotify Crawler Dashboard');
kue.app.listen(3000);


// Thread Shutdown Procedure
var shutdown_procedure = function (sig) {
	Logger.info("Queue shutting down...");
	Queue.shutdown(5000, function (err) {
		if (err) Logger.error('Kue shutdown: ', err);
		process.exit(0);
	});
}


// Process Failure Events
process.on('SIGTERM', shutdown_procedure);
process.on('SIGINT', shutdown_procedure);


// Log Queue Level Events
Queue.on('job complete', function (id, result) {
	Logger.info('Completed Job: %d, Total Completed: %d', id, ++completed_jobs);
});

Queue.on('job failed', function (id, result) {
	Logger.error("Job: ", id, " failed with result: ", result);
});

Queue.on('error', function (err) {
	Logger.error("Queue Error: ", err);
});