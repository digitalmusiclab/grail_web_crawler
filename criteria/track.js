'use strict';

// Load Dependencies
const utils = require('./utils');


/* 
    Track Level Comparision

    @param {object} source - The source Track
    @param {object} compare - Track to be Compared
*/
exports = module.exports = function criteriaScore(source, compare) {

    // Track Position
    const absolutePos = Math.abs(source.position - compare.position);
    const max_position = Math.max(source.position, compare.position);
    
    // Critera Scores
    const criteria_track_pos = (absolutePos/max_position).toFixed(4);
    const criteria_track_name = utils.stringDistance(source.name, compare.name);

    // Overall Critera Scores
    const scores = [criteria_track_pos, criteria_track_name]
    const criteria_overall = utils.average(scores);

    // Return Critera Scores
    return { criteria_track_name, criteria_track_pos, criteria_overall };
}