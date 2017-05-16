'use strict';

// Load Dependencies
const _ = require('lodash');
const utils = rootRequire("criteria/utils");


exports = module.exports = class SpotifyArtist {
  
  
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.cardinality = data.cardinality;
  }


  criteriaScore(name, cardinality) {
     // Release Count
    const min_count = Math.min(cardinality, this.cardinality);
    const max_count = Math.max(cardinality, this.cardinality);
    
    // Critera Scores
    const artist_criteria_name = utils.stringDistance(name, this.name);
    const artist_criteria_cardinality = (min_count/max_count).toFixed(2);

    // Overall Critera Scores
    const scores = [artist_criteria_name, artist_criteria_cardinality];
    const criteria_overall = utils.average(scores);

    // Return Critera Scores
    return { artist_criteria_name, artist_criteria_cardinality, artist_criteria_overall };
  }

};