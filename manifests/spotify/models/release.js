'use strict';

// Load dependencies
const _ = require('lodash');
const SpotifyTrack = require("./track");


exports = module.exports = class SpotifyRelease {

    constructor(data) {

        this.id = data.id;
        this.name = data.name;
        this.cardinality = data.tracks.total;
        this.artist_id = null;

        this.tracks = _.map(data.tracks.items, (track) => {
            return new SpotifyTrack(track);
        });
    }
};
