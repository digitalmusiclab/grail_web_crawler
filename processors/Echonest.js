var Dispatch 	= require("../lib/Dispatch.js");
var Logger 		= require("../lib/Logger.js");
var Request 	= require('request');
var async 		= require('async');
var _ 			= require('lodash');

var EN_API_KEY 	= "DD1EDCULVNEMZDWBG";
var echonest_api = "https://developer.echonest.com/api/v4/song/profile"

var RateLimiter = require('limiter').RateLimiter;

// API limiter set to 500 requests / minute
var limiter = new RateLimiter(495, 'minute');

/*
	echonest_track_by_spotify_track
		- A function that processes jobs that will search 
		Echonest Song API via a Spotify Track ID.

	@param {Object} job
		- Object containing job metadata.
	@param {Function} done
		- Callback function to be called after job completion
		- Success: callback()
		- Error: callback(error)
*/
exports.echonest_track_by_spotify_track = function (job, done) {


	// Remove token from API limiter, callback invoked when
	// token bucket has tokens available.
	limiter.removeTokens(1, function (err, remainingRequests) {
		
		if (err) return done(err);

		// Source Spotify Track ID from job metadata
		var spotify_track_id = job.data.spotify_track_id;

		// Query Echonest Song API with Spotify Track ID
		echonest_track_query(spotify_track_id, function (err, songs) {
			
			// If Echonest API error, invoke callback with error
			if (err) return done(err);

			// If no songs returned, invoke successful callback
			if (!songs) return done();

			// Write Echonest Songs
			Dispatch.dispatchWriteJob({
				schema: "EchonestCrawl",
				data: {
					spotify_track_id: spotify_track_id,
					songs: songs
				}
			});
			
			return done();
		});
	
	})

};


/*
	echonest_track_query
		- Queries Spotify Track API for Spotify Track IDs using an
		ISRC identifier. If tracks are found, they are parsed and
		returned through a callback function.

	@param {String} spotify_track_id
		- Spotify Track ID to be queried by Echonest API
	@param {Function} callback
		- Callback function to be called after querying API
		- Success: callback(null, tracks)
		- Error: callback(error)
*/
var echonest_track_query = function (spotify_track_id, callback) {

	// Query API Parameters
	var query 	= "track_id=spotify:track:" + spotify_track_id;
	var api 	= "api_key=" + EN_API_KEY;
	var format 	= "format=json";
	var buckets = echonest_buckets();

	// Build request URL using parameters
	var url_parameters = [query, api, format, buckets].join("&");
	var url = [echonest_api, url_parameters].join("?");

	var request_params = {
		url: url,
		method: "GET",
		rejectUnauthorized: false
	}

	Request(request_params, function (error, response, body) {
		
		// Return Request Errors
		if (error) return callback(error);

		// Catch JSON Parsing Errors
		try {
			var data = JSON.parse(body);
		} catch (error) {
			return callback(error);
		}

		// Return JSON Object of songs from Query
		return callback(null, data.response.songs);
	});

}

// Build Bucket URL Parameters
var echonest_buckets = function () {
	var buckets = [
		"7digital-US", "7digital-AU", "7digital-UK", 
		"facebook", "fma", "twitter", "spotify-WW", 
		"seatwave", "lyricfind-US", "jambase", 
		"musixmatch-WW", "seatgeek", "openaura", 
		"spotify", "spotify-WW", "tumblr"
	];

	return buckets.map(function (namespace) {
		return "bucket=id:" + namespace;
	}).join("&");
}