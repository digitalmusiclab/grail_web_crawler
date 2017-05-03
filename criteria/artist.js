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
    const min_count = Math.min(source.release_count, compare.release_count);
    const max_count = Math.max(source.release_count, compare.release_count);
    
    // Critera Scores
    const criteria_artist_name = utils.stringDistance(source.name, compare.name);
    const criteria_artist_release_count = (min_count/max_count).toFixed(2);

    // Return Critera Scores
    return { criteria_artist_name, criteria_artist_release_count };
}