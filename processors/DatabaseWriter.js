var Logger = require("../lib/Logger.js");

/*
	Process Job

	@param {Object} job 
		- Object containing job metadata
		- Includes 'data', 'schema' to be written
	@param {Function} done 
		- Callback function to be called after job completion
		- Success: done()
		- Error: done(error)
*/
exports.processJob = function (job, done) {

	// Extract database schema and data to write from job metadata
	var schema 	= job.data.schema;
	var data 	= job.data.data;

	// Write Job Data to Database 
	db[schema].create(data)
	.then( function () {
		return done();
	})
	.catch(done);
}