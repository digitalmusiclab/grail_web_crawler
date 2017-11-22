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
    return StringSimilarity.compareTwoStrings(str1, str2).toFixed(4);
};

exports.average = (arr) => {
    const sum = arr.reduce((acc, val) => acc + parseFloat(val), 0);
    const average = (sum / arr.length);
    return average.toFixed(4);
};
