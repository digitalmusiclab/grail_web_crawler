'use strict';

// Load dependencies
const request = require('request');
const baseUrl = require('./base-url');
const headers = require('./headers');

/**
 * Given name of an artist and release, searches the MusicBrainz API for releases
 * with that information.  Returns metadata from release(s) that the API finds, 
 * or an error if nothing is found matching the query. Since multiple releases 
 * can match the query, an array of releases are returned.
 * 
 * @param {string} artistName - The name of the artist to search for the associated release
 * @param {string} albumName - The name of the release to search for
 * @param {function} callback - Called with found releases or an error
 */
exports = module.exports = function getReleaseByArtistAndName(artistName, albumName, callback) {
  request(
    {
      baseUrl,
      headers,
      qs: {
        fmt: 'json',
        query: `${albumName} AND artist:${artistName}`
      },
      uri: 'release'
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

      return callback(null, data.releases);
    }
  );
};
