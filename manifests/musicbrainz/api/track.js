'use strict';

// Load dependencies
const request = require('request');
const baseUrl = require('./base-url');
const headers = require('./headers');
const MusicBrainzTrack = require('./../models').Track;
const _ = require("lodash");



const sendRequest = function (parameters, callback) {

    request(parameters, (error, response, body) => {

        if (error) {
            return callback(error);
        }

        let data = null;
        try {
            data = JSON.parse(body);
        } 
        catch (error) {
            return callback(error);
        }

        if (data.error) {
            return callback(data.error);
        }

        return callback(null, data);

    });
}



exports.getByName = (trackName, artistName, callback) => {

    const requestParams = {
        baseUrl,
        headers,
        qs: { 
            query: `${trackName} AND artist:${artistName}`,
            fmt: 'json'
        },
        uri: "recording"
    }

    sendRequest(requestParams, function (error, data) {
        
        if (error) {
            return callback(error);
        }

        // Serialize recordings into `MusicBrainzTrack`s
        const tracks = _.map(data.recordings, (recording) => {
            return new MusicBrainzTrack(recording);
        });

        return callback(null, tracks);
    });
}


exports.getById = (id, callback) => {

    const requestParams = {
        baseUrl,
        headers,
        qs: { 
            fmt: 'json'
        },
        uri: `recording/${id}`
    }

    return sendRequest(requestParams, callback);
};
