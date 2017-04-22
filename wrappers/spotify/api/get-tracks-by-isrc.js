'use strict';

// Load dependencies
const _ = require('lodash');
const request = require('request');
const baseUrl = require('./base-url');
const SpotifyTrack = require('./../track');

/**
 * Queries the Spotify API for tracks given an ISRC.  For each track returned from
 * the API, serialize them into an array of `SpotifyTrack` and return them to the
 * caller.
 * 
 * @param {string} isrc - The ISRC to query the Spotify API with
 * @param {function} callback - Called with either the tracks found or an error
 * 
 * @return {void}
 */
exports = module.exports = function getTracksByIsrc(isrc, callback) {
  request(
    {
      baseUrl,
      qs: {
        limit: 50,
        q: `isrc:${isrc}`,
        type: 'track'
      },
      uri: 'search'
    },
    function getTracksResponse(error, response, body) {
      // Spotify reported an error, return it
      if (error) {
        return callback(error);
      }

      let data = null;
      try {
        data = JSON.parse(body);
      } catch (error) {
        // Could not parse the response, it was not well-formed JSON
        return callback(error);
      }

      // Invoke empty callback if no tracks returned
      if (!data.tracks) {
        return callback();
      }

      return callback(null, _.map(data.tracks.items, track => new SpotifyTrack(track)));
    }
  );
};
