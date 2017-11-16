'use strict';

// Load Dependencies
const utils = require('./utils');

/*
    Artist Level Comparision

    @param {object} source - The source Artist
    @param {object} compare - Artist to be Compared
*/
exports = module.exports = function criteriaScore(source, compare) {

    // Release Count
    const min_count = Math.min(source.cardinality, compare.cardinality);
    const max_count = Math.max(source.cardinality, compare.cardinality);

    // Critera Scores
    const artist_criteria_name = utils.stringDistance(source.name, compare.name);
    const artist_criteria_cardinality = (min_count/max_count).toFixed(4);

    // Overall Critera Scores
    const scores = [artist_criteria_name, artist_criteria_cardinality];
    const artist_criteria_overall = utils.average(scores);

    // Return Critera Scores
    return { artist_criteria_name, artist_criteria_cardinality, artist_criteria_overall };
};
