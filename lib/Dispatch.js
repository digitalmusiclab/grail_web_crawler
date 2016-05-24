var Logger 		= require("./Logger.js");
var JobQueue 	= require("./JobQueue.js");


/*
	dispatchWriteJob

	@param {Object} data
		- data containing schema, and values to
		be written to database
*/
exports.dispatchWriteJob = function (data) {
	return createJob("database_writer", data, "normal", true);
}

/*
	dispatchCrawlJob

	@param {Object} data
		- data to be attached to a crawl job,
		contains a namespace, and identifier
*/
exports.dispatchCrawlJob = function (data) {

	var namespace = data.namespace;
	var id = data.id;
	
	if (namespace == "isrc") {
		var params = {isrc: id};
		return createJob("spotify_track_by_isrc", params, "high", true);
	}

	if (namespace == "spotify:track") {
		var params = {spotify_track_id: id};
		return createJob("echonest_track_by_spotify_track", params, "high", true);
	}
	
}

/*
	createJob

	@param {String} name
		- name of job to be created
	@param {Object} data
		- data to be attached to job
*/
var createJob = function (name, data, priority, removeOnComplete) {
	JobQueue.create(name, data)
	.priority(priority)
	.attempts(10)
	.backoff({delay: 20*1000, type:'fixed'})
	.removeOnComplete(removeOnComplete)
	.save(function (error) {
		if (error) {
			Logger.error("[Dispatch - Create Job] %s, Job Name: %s, Job Data:", error, name,  data);
		}
	});
}