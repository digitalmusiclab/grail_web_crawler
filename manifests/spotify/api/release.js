'use strict';

// Load dependencies
const request = require('request');
const baseUrl = require('./base-url');

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
exports = module.exports = function getReleaseId(id, callback) {

  const requestParams = {
    baseUrl,
    uri: `albums/${id}`
  }

  request(requestParams, (error, response, body) => {
      
      if (error) {
        return callback(error);
      }

      let data = null;
      try {
        data = JSON.parse(body);
      } 
      catch (error) {
        return callback(error);
      }

      return callback(null, data);
    }
  );
};
