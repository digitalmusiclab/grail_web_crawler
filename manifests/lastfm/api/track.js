'use strict';

// Load dependencies
const _ = require('lodash');
const request = require('request');
const baseUrl = require('./base-url');



exports = module.exports = function getTrackByID(musicbrainzArtistId, musicbrainzTrackId, callback) {

    const requestParams = { 
        baseUrl,
        qs: {
            api_key: "b9e05b386939dbca75c553f6bdceebc1",
            format: "json",
            method: 'track.getinfo',
            artist: musicbrainzArtistId,
            track: musicbrainzTrackId
        }
    }

    request(requestParams, (error, response, body) => {

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

        return callback(null, data);
    });

}




exports = module.exports = function getTrackByName(artistName, trackName, callback) {

    const requestParams = { 
        baseUrl,
        qs: {
            api_key: "b9e05b386939dbca75c553f6bdceebc1",
            format: "json",
            method: "track.getinfo",
            artist: artistName,
            track: trackName
        }
    }

    request(requestParams, (error, response, body) => {

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

        return callback(null, data);
    });
}