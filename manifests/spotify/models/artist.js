'use strict';

// Load dependencies
const _ = require('lodash');
const SpotifyTrack = require('./track');

/**
 * Composes a Spotify album from the API.  Contains information about the album
 * itself, the id, tracks and artists associated with it.
 */
exports = module.exports = class SpotifyAlbum {
  /**
   * Constructs an instance of `SpotifyAlbum`.
   * 
   * @param {object} data - Payload from the Spotify API to convert into `SpotifyAlbum`
   * @param {object[]} data.artists - List of artists associated with the album
   * @param {string} data.artists[].id - Spotify identifier for the artist
   * @param {string} data.artists[].name - Name of the artist
   * @param {object} data.external_ids - External identifier associated with the album
   * @param {string} data.id - Spotify identifier for the album
   * @param {string} data.name - Name of the album
   * @param {object[]} data.tracks - Information about the tracks
   * @param {string} data.tracks[].id - Spotify identifier for the track
   * @param {string} data.tracks[].name - Name of the track
   */
  constructor(data) {
    this.artists = _.map(data.artists, artist => ({ id: artist.id, name: artist.name }));
    this.externalIds = data.external_ids;
    this.id = data.id;
    this.name = data.name;
    if (typeof data.tracks === 'object') {
      this.tracks = _.map(data.tracks.items, track => new SpotifyTrack(track));
    }
  }
};
