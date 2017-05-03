'use strict';

// Load dependencies
const request = require('request');
const baseUrl = require('./base-url');
const headers = require('./headers');

/**
 * @param {string} id - The identifier of the album to query from Spotify
 * @param {function} callback - Called with either the Releases found or an error
 */
exports = module.exports = function getReleaseById(id, callback) {
  request(
    {
      baseUrl,
      headers,
      qs: {
        fmt: 'json',
        inc: 'recordings+artists'
      },
      uri: `release/${id}`
    },
    (error, response, body) => {

      // MusicBrainz returned an error, return it
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

      // Music Brainz is most likely throttling us, return the error
      if (data.error) {
        return callback(data.error);
      }

      return callback(null, data);
    }
  );
};
