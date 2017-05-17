'use strict';

// Load dependencies
const request = require('request');
const baseUrl = require('./base-url');
const SpotifyRelease = require("./../models/release");



exports = module.exports = function getById(id) {

    return new Promise( (resolve, reject) => {

        const requestParams = {
            baseUrl,
            uri: `albums/${id}`
        }

        request(requestParams, (error, response, body) => {
                
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

                if (!data) {
                    return reject(null);
                }

                return resolve(new SpotifyRelease(data));
            }
        );

    });
};
