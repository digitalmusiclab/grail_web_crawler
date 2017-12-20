'use strict';

// Load dependencies
const SpotifyTrack = require("./../models/track");
const baseUrl = require('./base-url');
const request = require('request');
const _ = require("lodash");


exports.getByIsrc = (isrc) => {

    // search?type=track&q=isrc:USEE10001993

    const requestParams = {
        baseUrl,
        qs: {
            type: 'track',
            q: `isrc:${isrc}`
        },
        uri: `search`
    };

    return sendRequest(requestParams).then(parseSpotifyTracksFromResponse);
};



exports.getById = (id, callback) => {

    const requestParams = {
        baseUrl,
        uri: `tracks/${id}`
    };

    return sendRequest(requestParams);
};




const sendRequest = function (parameters) {

    return new Promise( (resolve, reject) => {

        request(parameters, (error, response, body) => {

            if (error) {
                return reject(error);
            }

            let data = null;
            try {
                data = JSON.parse(body);
            }
            catch (error) {
                return reject(error);
            }

            return resolve(data);
        });
    });
};

const parseSpotifyTracksFromResponse = (data) => {

    return new Promise( (resolve, reject) => {

        const items = data.tracks.items;

        // Return reject promise chain early if no items found
        if (!items) {
            return reject(null);
        }

        // Parse Reponse Items into SpotifyTrack objects
        const spotifyTracks = _.map(items, (item) => {
            return new SpotifyTrack(item);
        });

        return resolve(spotifyTracks);
    });
};
