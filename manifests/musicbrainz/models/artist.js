'use strict';

// Load Dependencies
const _ = require('lodash');
const utils = rootRequire("criteria/utils");


class MusicBrainzArtist {
    
    // Initializer
    constructor(data) {
	    this.name = data.name;
		this.cardinality = data.cardinality;
	}

    // Compute Artist Criteria Score
	criteriaScore(name, cardinality) {
		// Release Count
		const min_count = Math.min(cardinality, this.cardinality);
		const max_count = Math.max(cardinality, this.cardinality);
		
		// Critera Scores
		const artist_criteria_name = utils.stringDistance(name, this.name);
		const artist_criteria_cardinality = (min_count/max_count).toFixed(2);

		// Overall Critera Scores
		const scores = [artist_criteria_name, artist_criteria_cardinality];
		const artist_criteria_overall = utils.average(scores);

		// Return Critera Scores
		return { artist_criteria_name, artist_criteria_cardinality, artist_criteria_overall };
	}

};

module.exports = MusicBrainzArtist;