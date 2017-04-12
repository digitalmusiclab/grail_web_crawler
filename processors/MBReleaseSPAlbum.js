var Dispatch 	= require("../lib/Dispatch.js");
var Logger 		= require("../lib/Logger.js");
var Request 	= require('request');
var async 		= require('async');
var _ 			= require('lodash');


// Load RateLimiter for Spotify API
var SpotifyRateLimiter = require("../lib/RateLimiter").Spotify;
// var music_brainz_release_api = "http://musicbrainz.org/ws/2/release";
var music_brainz_release_api = "http://52.90.229.107:8080/ws/2/release/"



/*
	musicbrainz_release_by_spotify_artist_album
		- A function that processes jobs that will search for
		MusicBrainz Releases via a Spotify Album, Artist, and Track Count

	@param {Object} job
		- Object containing job metadata.
	@param {Function} done
		- Callback function to be called after job completion
		- Success: callback()
		- Error: callback(error)
*/
exports.musicbrainz_release_by_spotify_artist_album = function (job, done) {


	// Ask RateLimiter for time left before a request can be made
	SpotifyRateLimiter(process.pid, function (err, timeleft) {
		
		// If RateLimiter error, invoke callback with error
		if (err) {
			return done(err);
		}

		// Source Spotify Album, Artist and Track Count from job metadata
		var spotify_album_id 			= job.data.spotify_album_id;
		var spotify_album_name 			= job.data.spotify_album_name;
		var spotify_album_cardinality 	= job.data.spotify_album_cardinality;
		var spotify_artist_name 		= job.data.spotify_artist_name;

		// Parse time left returned by RateLimiter
		var time = parseInt(timeleft, 10);
		var sleepTime = Math.max(time, 0);

		// Timeout execution until request can be made
		setTimeout(function() {

			// Query Musicbrainz Release API with Spotify Metadata
			music_brainz_release_query(spotify_album_name, spotify_artist_name, function (err, album_metadata) {

				// If API error, invoke callback with error
				if (err) return done(err);

				// If no metadata returned, invoke successful callback
				if (! album_metadata) return done();

				const release_count = album_metadata["release-list"].count;

				if ( parseInt(release_count, 10) < 1) {
					return done();
				}

				// Write Spotify Albums
				Dispatch.dispatchWriteJob({
					schema: "MBReleaseSPAlbumCrawl",
					data: {
						spotify_album_id: spotify_album_id,
						spotify_album_name: spotify_album_name,
						spotify_artist_name: spotify_artist_name,
						spotify_album_cardinality: spotify_album_cardinality,
						metadata: album_metadata
					}
				});
				
				return done();
			});

  		}, sleepTime);

	})	
}


/*
	music_brainz_release_query
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
var music_brainz_release_query = function (spotify_album_name, spotify_artist_name, callback) {

	// Query API Parameters
	// http://musicbrainz.org/ws/2/release?query=Nevermind%20AND%20artist:Nirvana&fmt=json

	spotify_album_name = encodeURIComponent(spotify_album_name);
	spotify_artist_name = encodeURIComponent(spotify_artist_name);

	var query = "query=" + spotify_album_name +  encodeURIComponent(" AND artist:") + spotify_artist_name;
	var format = "fmt=json";

	// TODO: Query for response offsets
	var url_parameters = [query, format].join("&");
	var url = [music_brainz_release_api, url_parameters].join("?");

	Request(url, function (error, response, body) {

		// Return Request Errors
		if (error) return callback(error);

		if (response.statusCode > 299) {
			return callback (new Error("Musicbrainz Service Unavailable"))
		}

		// Catch JSON Parsing Errors
		try {
			var data = JSON.parse(body);
		} catch (error) {
			return callback(error);
		}

		// Invoke callback with metadata
		return callback(null, data);
	});

}