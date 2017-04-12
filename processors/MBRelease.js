var Dispatch 	= require("../lib/Dispatch.js");
var Logger 		= require("../lib/Logger.js");
var Request 	= require('request');
var async 		= require('async');
var _ 			= require('lodash');


// Load RateLimiter for Spotify API
var SpotifyRateLimiter = require("../lib/RateLimiter").Spotify;

// MusicBrainz AWS API Endpoint
var music_brainz_release_api = "http://52.90.229.107:5000/ws/2/release/"


exports.mb_release_by_mb_release_id = function (job, done) {


	const { musicbrainz_release_id, spotify_album_id } = job.data;

	music_brainz_release_query(musicbrainz_release_id, function (err, metadata) {

		if (err) return done(err);

		if (!metadata) return done();

		Dispatch.dispatchWriteJob({
			schema: "MusicBrainzRelease",
			data: {
				musicbrainz_release_id,
				spotify_album_id,
				metadata
			}
		});
		
		return done();
	});
}


var music_brainz_release_query = function (mb_release_id, callback) {

	
	// TODO: Query for response offsets
	//http://musicbrainz.org/ws/2/release/<MBID>?inc=recordings&fmt=json

	// Query API Parameters
	var url_parameters = ["inc=recordings", "fmt=json"].join("&");
	var endpoint = [music_brainz_release_api, mb_release_id].join("")
	var url = [endpoint, url_parameters].join("?");

	Request(url, function (error, response, body) {

		// Return Request Errors
		if (error) {
			return callback(error);
		}

		// Return Service Unavailable Error
		if (response.statusCode > 299) {
			return callback (new Error("Musicbrainz Service Unavailable"))
		}

		// Parse JSON Response
		try {
			var data = JSON.parse(body);
		} catch (error) {
			return callback(error);
		}

		// No Release Found
		if (data.error) {
			return callback()
		}

		// Return Found Release Data
		return callback(null, data);
	});

}