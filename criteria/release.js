'use strict';

// Load Dependencies
const utils = require('./utils');
const _ = require("lodash");

/* 
    Release Level Comparision

    @param {object} source - The source Release
    @param {object} compare - Release to be Compared
*/
exports = module.exports = function criteriaScore(source, compare) {

    // Release Cardinality
    const min_cardinality = Math.min(source.cardinality, compare.cardinality);
    const max_cardinality = Math.max(source.cardinality, compare.cardinality);

    // Sanity check that tracks are sorted by position
    source.tracks  =  _.sortBy(source.tracks, "position");
    compare.tracks =  _.sortBy(compare.tracks, "position");

    // Compare Release Track Names
    let trackNameDistances = [];
    for (var i = 0; i < max_cardinality; i++) {

        const source_track = source.tracks[i];
        const compare_track = compare.tracks[i];

        if (source_track && compare_track) {
            const levDistance = utils.stringDistance(source_track.name, compare_track.name);
            trackNameDistances.push(levDistance);
        } else {
            trackNameDistances.push(0);
        }
    }
    
    // Critera Scores
    const release_criteria_name = utils.stringDistance(source.name, compare.name);
    const release_criteria_cardinality = (min_cardinality/max_cardinality).toFixed(4);
    const release_criteria_track_names = utils.average(trackNameDistances);

    // Overall Critera Scores
    const scores = [release_criteria_name, release_criteria_cardinality, release_criteria_track_names]
    const release_criteria_overall = utils.average(scores);

    // Return Critera Scores
    return { release_criteria_name, release_criteria_cardinality, release_criteria_track_names, release_criteria_overall };
}