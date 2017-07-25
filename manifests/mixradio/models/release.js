'use strict';

// Load dependencies
const _ = require('lodash');
const MixRadioTrack = require('./track');



exports = module.exports = class MixRadioRelease {

    constructor(data) {
        this.id = data.mr_release_id;
        this.name = data.mr_release_name;
        this.cardinality = parseInt(data.mr_release_cardinality);
        this.artist_id = data.mr_artist_id;

        this.tracks = _.chain(data.mr_release_tracks)
            .map((track) => {
                const { mr_artist_id, mr_release_id } = data;
                return new MixRadioTrack(_.merge(track, { mr_artist_id, mr_release_id }));
            })
            .sortBy("position")
            .value();
    }

};
