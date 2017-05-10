'use strict';

// Load dependencies
const _ = require('lodash');
const SpotifyTrack = require('./track');



/**
 * Composes a Spotify album from the API.  Contains information about the album
 * itself, the id, tracks and artists associated with it.
 */
exports = module.exports = class LastFmArtist {


  /**
   * Constructs an instance of `SpotifyAlbum`.
   * 
   * @param {object} data - Payload from the Spotify API to convert into `SpotifyAlbum`
   * @param {string} data.tracks[].name - Name of the track
   */
  constructor(data) {}
  
};
