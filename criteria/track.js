'use strict';

// Load Dependencies
const utils = require('./utils');
const assert = require('assert');


/*
    Track Level Comparision

    @param {object} source - The source Track
    @param {object} compare - Track to be Compared
*/
exports = module.exports = function criteriaScore(source, compare) {

    // TODO: Compute critera scores for available attributes of source and compare
    assert(source.position, "Source Track Position");
    assert(source.name, "Source Track Name");
    assert(compare.position, "Compare Track Position");
    assert(compare.name, "Compare Track Name");

    // Track Position
    const absolutePos = Math.abs(source.position - compare.position);
    const max_position = Math.max(source.position, compare.position);

    // Critera Scores
    const track_criteria_pos = ( 1 - ( absolutePos / max_position ) ).toFixed(4);
    const track_criteria_name = utils.stringDistance(source.name, compare.name);

    // Overall Critera Scores
    const scores = [track_criteria_pos, track_criteria_name];
    const track_criteria_overall = utils.average(scores);

    // Return Critera Scores
    return { track_criteria_name, track_criteria_pos, track_criteria_overall };
};
