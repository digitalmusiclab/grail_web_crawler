'use strict';

// Load dependencies
const _ = require('lodash');

/*

    Spotify Track

    @param { string } id - Spotify Track ID
    @param { string } name - Spotify Track Name
    @param { integer } position - Spotify Track Position
    @param { string } release_id - Spotify Release ID
    @param { array } artists{id, name} - Json Object of Spotify Artist ID and Name
*/
exports = module.exports = class SpotifyTrack {
  
  constructor(data) {

    this.id = data.id;
    this.name = data.name;
    this.position = data.track_number;
    this.release_id = (data.album) ? data.album.id : null;
    this.artists = _.map(data.artists, (artist) => ({ id: artist.id, name: artist.name }));
  }

};
