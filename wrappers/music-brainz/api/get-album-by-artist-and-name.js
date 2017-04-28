'use strict';

// Load dependencies
const request = require('request');
const baseUrl = require('./base-url');

/**
 * Given name of an artist and album, searches the Music Brainz API for an album
 * with that information.  Returns the metadata that the API finds, or an error
 * if nothing is found matching the query.  Since multiple albums can match the
 * query, an array of albums are returned.
 * 
 * @param {string} artist - The name of the artist to search for the associated album
 * @param {string} albumName - The name of the album to search for
 * @param {function} callback - Called with the album metadata or an error
 */
exports = module.exports = function getAlbumByArtistAndName(artist, albumName, callback) {
  request(
    {
      baseUrl,
      headers: {
        'User-Agent': 'Grail/0.1.0 ( baronemda@gmail.com )'
      },
      qs: {
        fmt: 'json',
        query: `${albumName} AND artist:${artist}`
      },
      uri: 'release'
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

      // Music Brainz is most likely throttling us, return the error
      if (data.error) {
        return callback(data.error);
      }

      return callback(null, data.releases);
    }
  );
};
