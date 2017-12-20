'use strict';

// Load dependencies
const request = require('request');
const baseUrl = require('./base-url');
const _ = require("lodash");
const SpotifyArtist = require("./../models/artist");



/* Returns a promise of a SpotifyArtist Object */
exports = module.exports = function getById(id) {

    return new Promise( (resolve, reject) => {

        const requestParams = {
            baseUrl,
            uri: `artists/${id}/albums`
        };

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

                const responseItem = data.items[0];

                if (!responseItem) {
                    return reject(null);
                }

                // Extract Artist Metadata from Response
                const name = responseItem.artists[0].name;
                const cardinality = data.total;

                // Create instance of Spotify Artist Object
                const spotifyArtist = new SpotifyArtist({ id, name, cardinality });

                // Return Spotify Artist Object
                return resolve(spotifyArtist);
            }
        );

    });

};
