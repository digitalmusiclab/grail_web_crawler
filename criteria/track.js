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
    const min_position = Math.min(source.position, compare.position);
    const max_position = Math.max(source.position, compare.position);
    
    // Critera Scores
    const criteria_track_pos = (min_position/max_position).toFixed(2);
    const criteria_track_name = utils.stringDistance(source.name, compare.name);

    // Return Critera Scores
    return { criteria_track_name, criteria_track_pos };
}