var Logger = require("../lib/Logger.js");
var db = require("../models/index.js");


/*
	Process Job

	@param {Object} job 
		- Object containing job metadata
	@param {Function} done 
		- Callback function to be called after job completion
		- Success: done()
		- Error: done(error)
*/
exports.processJob = function (job, done) {

	// Extract database schema and data to write from job metadata
	var writer_schema 	= job.data.schema;
	var writer_data 	= job.data.data;


	// Use schema to decide how data is written
	if (writer_schema == "SpotifyCrawl") {
		return write_spotify_crawl(writer_data, done);
	}

	if (writer_schema == "EchonestCrawl") {
		return write_echonest_crawl(writer_data, done);
	}
}


/*
	write_spotify_crawl

	@param {Object} data
		- Object containing data to be written to database
	@param {Function} done
		- Callback function to be called after data is written.
*/
var write_spotify_crawl = function (data, done) {
	db.SpotifyCrawl.create(data).then(function () {
		return done();
	}).catch(function (error) {
		return done(error);
	});
}


/*
	write_spotify_crawl

	@param {Object} data
		- Object containing data to be written to database
	@param {Function} done
		- Callback function to be called after data is written.
*/
var write_echonest_crawl = function (data, done) {
	db.EchonestCrawl.create(data).then(function () {
		return done();
	}).catch(function (error) {
		return done(error);
	});
}