'use strict';

// Load dependencies
const _ = require('lodash');
const assert = require('assert');

exports = module.exports = class MixRadioTrack {

  constructor(data) {

    assert(data.mr_track_position, "MixRadioTrack.position");

    this.id = data.mr_track_id;
    this.name = data.mr_track_name;
    this.position = parseInt(data.mr_track_position);
    this.artist_id = data.mr_artist_id;
    this.release_id = data.mr_release_id;
  }

};