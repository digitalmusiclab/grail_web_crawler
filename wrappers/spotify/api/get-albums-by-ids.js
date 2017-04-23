'use strict';

// Load dependencies
const _ = require('lodash');
const request = require('request');
const baseUrl = require('./base-url');
const SpotifyAlbum = require('./../album');

/**
 * Requests information for a list of albums from the Spotify API and returns them 
 * to the caller when the request is completed.  Serializes the albums into a
 * `SpotifyAlbum` class.
 * 
 * @param {string[]} ids - The identifiers of the albums to query from Spotify
 * @param {function} callback - The function to call when done
 * 
 * @return {void}
 */
exports = module.exports = function getAlbumsByIds(ids = [], callback) {
  request(
    {
      baseUrl,
      qs: { ids: ids.join(',') },
      uri: 'albums'
    },
    (error, response, body) => {
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

      return callback(null, _.map(data.albums, album => new SpotifyAlbum(album)));
    }
  );
};
