'use strict';

/**
 * Composes a Music Brainz album from the API.  Contains information about the album
 * itself and artists associated with it.
 */
exports = module.exports = class MusicBrainzAlbum {
  /**
   * Constructs an instance of `MusicBrainzAlbum`.
   * 
   * @param {object} data - Payload from the Spotify API to convert into `MusicBrainzAlbum`
   * @param {string} data.spotifyArtistName - Nmae of the artist
   * @param {string} data.spotifyAlbumCardinality - Cardinality of the album
   * @param {object} data.metadata - Extra metadata about the album
   */
  constructor(data) {
    this.spotifyAlbumName = data.spotifyAlbumName;
    this.spotifyArtistName = data.spotifyArtistName;
    this.metadata = data.metadata;
  }
};
