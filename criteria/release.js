'use strict';

// Load Dependencies
const utils = require('./utils');

/* 
    Release Level Comparision

    @param {object} source - The source Release
    @param {object} compare - Release to be Compared
*/
exports = module.exports = function criteriaScore(source, compare) {

    // Release Cardinality
    const min_cardinality = Math.min(source.cardinality, compare.cardinality);
    const max_cardinality = Math.max(source.cardinality, compare.cardinality);
    
    // Critera Scores
    const criteria_release_name = utils.stringDistance(source.name, compare.name);
    const criteria_release_cardinality = (min_cardinality/max_cardinality).toFixed(2);

    // Return Critera Scores
    return { criteria_release_name, criteria_release_cardinality };
}