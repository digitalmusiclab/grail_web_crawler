'use strict';

// Load Dependencies
const Levenshtein = require('fast-levenshtein');


/*
    Compares two strings using the Levenshtein Distance

    @param {string} str1 - String to be compared
    @param {string} str2 - String to be compared
*/
exports.stringDistance = (str1, str2) => {
    return Levenshtein.get(str1, str2, { useCollator: true });
}