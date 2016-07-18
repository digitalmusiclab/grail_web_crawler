var Dispatch 	= require("../lib/Dispatch.js");
var Logger 		= require("../lib/Logger.js");
var Request 	= require('request');
var async 		= require('async');
var _ 			= require('lodash');


// Load RateLimiter for Spotify API
var SpotifyRateLimiter = require("../lib/RateLimiter").Spotify;
var spotify_album_api = "https://api.spotify.com/v1/albums";


exports.spotify_album_by_spotify_album_ids = function (job, done) {

	SpotifyRateLimiter(process.pid, function (err, timeleft) {
		
		if (err) return done(err);
		
		var spotify_album_ids = job.data.spotify_album_ids;

		var time = parseInt(timeleft, 10);
		var sleepTime = Math.max(time, 0);

		setTimeout(function() {

			spotify_album_batch_query(spotify_album_ids, function (err, albums) {

				if (err) return done(err);

				if (!albums) return done();

				_.each(albums, function (album_metadata) {

					Dispatch.dispatchWriteJob({
						schema: "SpotifyAlbumCrawl",
						data: {
							spotify_album_id: album_metadata.id,
							metadata: album_metadata
						}
					});

				})
				
				return done();
			});

  		}, sleepTime);

	})

}


var spotify_album_batch_query = function (spotify_album_ids, callback) {

	var album_ids = spotify_album_ids.join(",");
	var url_query_params = ["ids", album_ids].join("=");
	var url = [spotify_album_api, url_query_params].join("?");

	Request(url, function (error, response, body) {
		
		if (error) return callback(error);
		
		try {
			var data = JSON.parse(body);
		} catch (error) {
			return callback(error);
		}
	
		if (!data.albums) return callback();

		return callback(null, data.albums);
	});
}


/*
	spotify_album_by_spotify_track
		- A function that processes jobs that will search for
		Spotify Albums via a Spotify Album ID results from 1st 
		crawl phase one (ISRC=>Spotify).

	@param {Object} job
		- Object containing job metadata.
	@param {Function} done
		- Callback function to be called after job completion
		- Success: callback()
		- Error: callback(error)
*/
exports.spotify_album_by_spotify_album_id = function (job, done) {


	// Ask RateLimiter for time left before a request can be made
	SpotifyRateLimiter(process.pid, function (err, timeleft) {
		
		// If RateLimiter error, invoke callback with error
		if (err) {
			return done(err);
		}

		// Source Spotify Album ID from job metadata
		var spotify_album_id = job.data.spotify_album_id;

		// Parse time left returned by RateLimiter
		var time = parseInt(timeleft, 10);
		var sleepTime = Math.max(time, 0);


		// Timeout execution until request can be made
		setTimeout(function() {

			// Query Spotify Album API with Spotify Album ID
			spotify_album_query(spotify_album_id, function (err, album_metadata) {

				// If Spotify API error, invoke callback with error
				if (err) return done(err);

				// If no tracks returned, invoke successful callback
				if (!album_metadata) return done();

				// Write Spotify Albums
				Dispatch.dispatchWriteJob({
					schema: "SpotifyAlbumCrawl",
					data: {
						spotify_album_id: spotify_album_id,
						metadata: album_metadata
					}
				});
				
				return done();
			});

  		}, sleepTime);

	})	
}


/*
	spotify_album_query
		- Queries Spotify Album API for Spotify Album Data using an
		Spotify Album identifier. If album metadata is found, it is 
		parsed and returned through a callback function.

	@param {String} spotify_album_id
		- Album ID to be queried by Spotify Album API
	@param {Function} callback
		- Callback function to be called after querying API
		- Success: callback(null, album_metadata)
		- Error: callback(error)
*/
var spotify_album_query = function (spotify_album_id, callback) {

	// Query API Parameters
	var query 	= "q=isrc:" + isrc;
	var type 	= "type=track";
	var limit 	= "limit=50";

	// TODO: Query for response offsets

	var url_parameters = [query, type, limit].join("&");
	var url = [spotify_album_api, url_parameters].join("?");

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