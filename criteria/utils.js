'use strict';

// Load Dependencies
const Levenshtein = require('fast-levenshtein');


/*
    Compares two strings using the Levenshtein Distance

    @param {string} str1 - String to be compared
    @param {string} str2 - String to be compared
*/
exports.stringDistance = (str1, str2) => {
    const maxLength = Math.max(str1.lenght, str2.length);
    const levDistance = Levenshtein.get(str1, str2, { useCollator: true });
    return levDistance/maxLength;
}

exports.average = (arr) => {
    const sum = arr.reduce((acc, val) => acc + val, 0);
    return sum / arr.length;
}