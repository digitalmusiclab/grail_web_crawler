'use strict';

/**
 * Composes a Music Brainz album from the API.  Contains information about the album
 * itself, the id, tracks and artists associated with it.
 */
exports = module.exports = class MusicBrainzAlbum {
  /**
   * Constructs an instance of `MusicBrainzAlbum`.
   * 
   * @param {object} data - Payload from the Spotify API to convert into `MusicBrainzAlbum`
   * @param {string} data.spotifyAlbumId - Identifier for the album on Spotify
   * @param {string} data.spotifyAlbumName - Name of the album
   * @param {string} data.spotifyArtistName - Nmae of the artist
   * @param {string} data.spotifyAlbumCardinality - Cardinality of the album
   * @param {object} data.metadata - Extra metadata about the album
   */
  constructor(data) {
    this.spotifyAlbumCardinality = data.spotifyAlbumCardinality;
    this.spotifyAlbumId = data.spotifyAlbumId;
    this.spotifyAlbumName = data.spotifyAlbumName;
    this.spotifyArtistName = data.spotifyArtistName;
    this.metadata = data.metadata;
  }
};
