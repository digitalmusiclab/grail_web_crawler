'use strict';

// Load dependencies
const _ = require('lodash');

/**
 * Composes a Spotify track from the API.  Contains information about the track
 * itself, the ISRC, album and artists associated with it.
 */
exports = module.exports = class SpotifyTrack {
  /**
   * Constructs an instance of `SpotifyTrack`.
   * 
   * @param {object} data - Payload from the Spotify API to convert into `SpotifyTrack`
   * @param {object[]} data.artists - List of artists associated with the track
   * @param {string} data.artists[].id - Spotify identifier for the artist
   * @param {string} data.artists[].name - Name of the artist
   * @param {object} data.album - Information about the album
   * @param {string} data.album.id - Spotify identifier for the album
   * @param {string} data.album.name - Name of the album
   * @param {string} data.external_ids.isrc - ISRC associated with the track
   * @param {object} data.track - Information about the track
   * @param {string} data.track.id - Spotify identifier for the track
   * @param {string} data.track.name - Name of the track
   */
  constructor(data) {
    this.artists = _.map(data.artists, artist => ({ id: artist.id, name: artist.name }));
    if (typeof data.album === 'object') {
      this.album = {
        id: data.album.id,
        name: data.album.name
      };
    }
    this.externalIds = data.external_ids;
    this.track = {
      id: data.id,
      name: data.name
    };
  }
};
