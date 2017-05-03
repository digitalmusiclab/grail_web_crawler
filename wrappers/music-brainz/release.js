'use strict';

// Load Dependencies
const _ = require('lodash');
const MusicBrainzTrack = require('./track');

/**
 * Composes a Music Brainz album from the API.  Contains information about the album
 * itself and artists associated with it.
 */
exports = module.exports = class MusicBrainzRelease {
  /**
   * Constructs an instance of `MusicBrainzRelease`.
   * 
   * @param {object} data - Payload from the Spotify API to convert into `MusicBrainzRelease`
   * @param {string} data.id - MusicBrainz Release Identifier
   * @param {string} data.title - Name of the Release
   * @param {Array[Objects]} data.artist-credit - Name of Artists
   * @param {Array[Objects]} data.media - Media Items of Release
   */
  constructor(data) {

    // Release Identifier
    this.id = data.id;
    
    // Release Name
    this.name = data.title;

    // Map Album Artists
    this.artists = _.map(data["artist-credit"], credit => {
      return { id: credit.artist.id, name: credit.artist.name };
    });
    
    // Map Album Tracks
    this.tracks = _.reduce(data.media, (acc, media) => {
      const tracks = _.map(media.tracks, (track) => new MusicBrainzTrack(track));
      return acc.concat(tracks);
    }, []);

    // Track Count
    this.cardinality = this.tracks.length;
  }
};