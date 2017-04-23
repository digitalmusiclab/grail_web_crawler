'use strict';

// Load dependencies
const request = require('request');
const baseUrl = require('./base-url');
const SpotifyAlbum = require('./../album');

/**
 * Requests information for an album from the Spotify API and returns it to the
 * caller when the request is completed.  Serializes the album into a
 * `SpotifyAlbum` class.
 * 
 * @param {string} id - The identifier of the album to query from Spotify
 * @param {function} callback - The function to call when done
 * 
 * @return {void}
 */
exports = module.exports = function getAlbumById(id, callback) {
  request({
    baseUrl,
    uri: `albums/${id}`
  }, (error, response, body) => {
    // Spotify returned an error, return it
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

    return callback(null, new SpotifyAlbum(data));
  });
};
