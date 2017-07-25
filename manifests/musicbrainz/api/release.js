'use strict';

// Load dependencies
const request = require('request');
const baseUrl = require('./base-url');
const headers = require('./headers');
const MusicBrainzTrack = require('./../models').Track;
const MusicBrainzRelease = require('./../models').Release;
const _ = require("lodash");


/*
    SendRequest - Send request to MusicBrainz API

    @param { String } uri - MusicBrainz Resource
    @param { Object } qs - Query String Key-Value Pairs 

    @return { Promise } Response Data
*/
const sendRequest = function (uri, qs) {

    const requestParams = { baseUrl, headers, qs, uri };

    return new Promise( (resolve, reject) => {

        request(requestParams, (error, response, body) => {

            // Catch Request Errors
            if (error) {
                return reject(error);
            }

            // Check for HTTP 200 - OK Status
            if (response.statusCode !== 200) {

                const responseContentType = response.headers["content-type"];
                
                // Handle Return JSON API Errors
                if (responseContentType.includes("application/json")) {
                    const data = JSON.parse(body);
                    return reject(new Error(data.error));
                }

                // Return HTTP Status Code
                return reject(new Error(response.statusMessage));
            }
            
            // Try Parsing JSON
            let data = null;
            try {
                data = JSON.parse(body);
            } 
            catch (error) {
                return reject(error);
            }

            // Look for MusicBrainz Error Object
            if (data.error) {
                return reject(data.error);
            }

            return resolve(data);
        });
    });
};


/*
    GetByName - Returns Promise of an array of `MusicBrainzRelease`.
    or empty array if no releases found.

    @param { String } releaseName - release name search parameter
    @param { String } artistName - artist name search parameter

    @return { Promise[`MusicBrainzRelease`]}
*/
exports.getByName = (releaseName, artistName) => {

    const queryParams = { 
        query: `${releaseName} AND artist:${artistName}`,
        fmt: 'json'
    };

    return sendRequest('release', queryParams)
        .then(MusicBrainzRelease.JSONResponseMapper);
};



/*
    GetById - Queries the MusicBrainz API for a MusicBrainzRelease
    using a MusicBrainzID. Returns a Promise of a `MusicBrainzRelease`
    or null if there are no matches found.

    @param { String } mbid - MusicBrainz Release ID

    @return { Promise(`MusicBrainzRelease`) || null } - the query result
*/
exports.getById = (mbid) => {

    // Include recordings and artists in query results
    const queryParams = { 
        inc: 'recordings+artists',
        fmt: 'json'
    };

    return sendRequest(`release/${mbid}`, queryParams)
        .then( (data) => {

            // Extract Release Id and Name
            const releaseId = data.id;
            const releaseName = data.title;

            // Parse array of `MusicBrainzTrack`s
            const releaseTracks = MusicBrainzTrack.JSONMediaMapper(data);
            
            // Sort tracks by their position
            const sortedTracks = _.sortBy(releaseTracks, "position");

            // NOTE: Only checking a single artist credit
            const artistCredit = data["artist-credit"][0];
            const artistId = (artistCredit) ? artistCredit.artist.id : null;

            // Break out early if no realease name, artist, or tracks are found
            if (!releaseId || !releaseName || !releaseTracks.length || !artistId) {
                return Promise.resolve(null);
            }

            // Map to MusicBrainz Release Object
            return new MusicBrainzRelease({ 
                id: releaseId,
                name: releaseName,
                tracks: sortedTracks,
                artist_id: artistId
            });
        });
};