'use strict';

// Load dependencies
const _ = require('lodash');
const MixRadioTrack = require('./track');

exports = module.exports = class MixRadioRelease {
  /*
    mr_release_id: 1321422,
    mr_release_name: "I Should Coco",
    mr_release_cardinality: "13",
    mr_artist_id: "10055880",
    mr_artist_name: "Remember Me Soundtrack",
    mr_release_tracks: [{
        "mr_track_id": "1321455",
        "mr_track_name": "Lenny"
        "mr_track_position": "6",
        "mb_track_id": "NULL",
        "mb_release_id": "NULL"
    }]
  */
  constructor(data) {
    
    this.id = data.mr_release_id;
    this.name = data.mr_release_name;
    this.cardinality = data.mr_release_cardinality;
    this.artist_id = data.mr_artist_id;

    this.tracks = _.chain(data.mr_release_tracks)
        .map((track) => {
            const id = track.mr_track_id;
            const name = track.mr_track_name;
            const position = track.mr_track_position;
            return new MixRadioTrack({ id, name, position });
        })
        .sortBy("position").value();
  }

};
