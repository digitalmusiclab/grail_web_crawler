'use strict';

// Load Dependencies
const Levenshtein = require('fast-levenshtein');
const StringSimilarity = require('string-similarity');


/*
    Compares two strings using the Levenshtein Distance

    @param {string} str1 - String to be compared
    @param {string} str2 - String to be compared
*/
exports.stringDistance = (str1, str2) => {
    return StringSimilarity.compareTwoStrings(str1, str2);
}

exports.average = (arr) => {
    const sum = arr.reduce((acc, val) => acc + val, 0);
    return sum / arr.length;
}