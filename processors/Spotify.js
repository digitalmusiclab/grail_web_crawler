var Dispatch 	= require("../lib/Dispatch.js");
var Logger 		= require("../lib/Logger.js");
var Request 	= require('request');
var async 		= require('async');
var _ 			= require('lodash');


// Load RateLimiter for Spotify API
var SpotifyRateLimiter = require("../lib/RateLimiter").Spotify;
var spotify_api = "https://api.spotify.com/v1/search" 


/*
	spotify_track_by_isrc
		- A function that processes jobs that will search for
		Spotify Track IDs via an ISRC.

	@param {Object} job
		- Object containing job metadata.
	@param {Function} done
		- Callback function to be called after job completion
		- Success: callback()
		- Error: callback(error)
*/
exports.spotify_track_by_isrc = function (job, done) {


	// Ask RateLimiter for time left before a request can be made
	SpotifyRateLimiter(process.pid, function (err, timeleft) {
		
		// If RateLimiter error, invoke callback with error
		if (err) {
			return done(err);
		}

		// Source ISRC from job metadata
		var isrc = job.data.isrc;

		// Parse time left returned by RateLimiter
		var time = parseInt(timeleft, 10);
		var sleepTime = Math.max(time, 0);


		// Timeout execution until request can be made
		setTimeout(function() {

			// Query Spotify Track API with ISRC
			spotify_track_query(isrc, function (err, tracks) {

				// If Spotify API error, invoke callback with error
				if (err) return done(err);

				// If no tracks returned, invoke successful callback
				if (!tracks) return done();

				// Itterate over returned tracks
				_.forEach(tracks, function (track) {

					// Itterate over artists on track
					_.forEach(track.artists, function (artist) {

						// Dispatch new write job per artist
						Dispatch.dispatchWriteJob({
							schema: "SpotifyCrawl",
							data: {
								isrc: track.isrc,
								track_id: track.track_id,
								track_name: track.track_name,
								album_id: track.album_id,
								album_name: track.album_name,
								artist_id: artist.artist_id,
								artist_name: artist.artist_name
							}
						});

					});

					// // Dispatch new crawl job per track_id
					// Dispatch.dispatchCrawlJob({
					// 	namespace: "spotify:track",
					// 	id: track.track_id
					// });

				});

				return done();
			});

  		}, sleepTime);

	})	
}


/*
	spotify_track_query
		- Queries Spotify Track API for Spotify Track IDs using an
		ISRC identifier. If tracks are found, they are parsed and
		returned through a callback function.

	@param {String} isrc
		- ISRC to be queried by Spotify Track API
	@param {Function} callback
		- Callback function to be called after querying API
		- Success: callback(null, tracks)
		- Error: callback(error)
*/
var spotify_track_query = function (isrc, callback) {
	
	// Query API Parameters
	var query 	= "q=isrc:" + isrc;
	var type 	= "type=track";
	var limit 	= "limit=50";

	// TODO: Query for response offsets

	var url_parameters = [query, type, limit].join("&");
	var url = [spotify_api, url_parameters].join("?");

	Request(url, function (error, response, body) {

		// Return Request Errors
		if (error) return callback(error);

		// Catch JSON Parsing Errors
		try {
			var data = JSON.parse(body);
		} catch (error) {
			return callback(error);
		}

		// Invoke empty callback if no tracks returned
		if (!data.tracks) return callback();

		// Parse Response Track Items
		var tracks = _.map(data.tracks.items, function (item) {
			return {
				isrc: item.external_ids.isrc,
				track_id: item.id,
				track_name: item.name,
				album_id: item.album.id,
				album_name: item.album.name,
				artists: _.map(item.artists, function (artist) {
					return {artist_id: artist.id, artist_name: artist.name}
				})
			}
		});

		// Invoke callback with parsed tracks
		return callback(null, tracks);
	});

}