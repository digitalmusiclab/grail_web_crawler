'use strict';

// Load dependencies
const _ = require('lodash');

/**
 * Composes a MusicBrainz track from the MusicBrainz API.
 */
exports = module.exports = class MusicBrainzTrack {
  

  /**
   * Constructs an instance of `MusicBrainzTrack`.
   * 
   * @param {object} data - Payload from the MusicBrainz API to convert into `MusicBrainzTrack`
   * @param {string} data.id - MusicBrainz Track Identifier
   * @param {string} data.title - Track Name
   * @param {int} data.number - Track Position
   */
  constructor(data) {
    this.id = data.id;
    this.name = data.title;
    this.position = data.number;
  }
};