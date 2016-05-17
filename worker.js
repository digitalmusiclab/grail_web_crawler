var cluster 	= require('cluster');
var JobQueue 	= require("./lib/JobQueue.js");
var Logger 		= require("./lib/Logger.js");

if (cluster.worker) {
	Logger.info("Worker Process #%d loaded", cluster.worker.id);
}


/*
	Worker Processors
	- These modules export functions that are able to process
	jobs that are delivered through the JobQueue. The functions
	they export are invoked with parameters for job metadata, and
	a completion callback. When a processor finishes processing a job,
	the callback must be invoked. If the processor encounters an error
	while processing, an Error object can be passed as the first argument
	to the callback. Passing an error will notify the JobQueue to either
	reschedule the job, or mark the job as failed.
*/
var Spotify 		= require("./processors/Spotify.js");
var Echonest 		= require("./processors/Echonest.js");
var DatabaseWriter 	= require("./processors/DatabaseWriter.js");


/*
	JobQueue Job Routing
	- The JobQueue can ingest many types of jobs, each with a unique name.
	When the JobQueue delivers a job to be processed, a process function is
	invoked with the job metadata. To notify the JobQueue that a job can be 
	processed, JobQueue.process(), must be invoked with the following parameters.

	@param {String} - Job Name
	@param {Integer} - Processing Concurrency (how many jobs can be processed at once)
	@param {Function} - A process function invoked with job metadata, and completion callback.
*/
JobQueue.process("database_writer", 1, DatabaseWriter.processJob);
JobQueue.process("spotify_track_by_isrc", 1, Spotify.spotify_track_by_isrc);
JobQueue.process("echonest_track_by_spotify_track", 1, Echonest.echonest_track_by_spotify_track);


/*
	TODO: Critera Matching Step

	1. Load Processor
		var CriteraMatch = require("./processors/CriteraMatch.js");
	2. Process Critera Jobs
		JobQueue.process("spotify_criteria", 1, CriteraMatch.spotify_critera_match);
*/