'use strict';

// Load dependencies
const _ = require('lodash');
const utils = rootRequire('criteria/utils');


/**
 * Composes a MusicBrainz track from the MusicBrainz API.
 */
exports = module.exports = class MusicBrainzTrack {
  
  // Initializer
  constructor(data) {
    this.id = data.id;
    this.name = data.title;
    this.position = data.position;
  }

  // Compute Track Criteria Score
  criteriaScore(mixradio_name) {
    
    const criteria_track_name = utils.stringDistance(mixradio_name, this.name);
    const criteria_overall = criteria_track_name;

    return { criteria_overall, criteria_track_name };
  }

};