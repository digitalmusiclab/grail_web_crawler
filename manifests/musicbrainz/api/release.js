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

            if (data.error) {
                return reject(data.error);
            }

            return resolve(data);
        });
    });
}


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
    }

    return sendRequest('release', queryParams)
        .then(MusicBrainzRelease.JSONResponseMapper);
}



/*
    GetById - Returns Promise a MusicBrainzRelease

    @param { String } mbid - MusicBrainz Release ID

    @return { Promise } MusicBrainz Release
*/
exports.getById = (mbid) => {

    const queryParams = { 
        inc: 'recordings+artists',
        fmt: 'json'
    };

    return sendRequest(`release/${mbid}`, queryParams)
        .then( (data) => {

            const releaseId = data.id;
            const releaseName = data.title;
            
            // Array of `MusicBrainzTrack`
            const releaseTracks = MusicBrainzTrack.JSONMediaMapper(data);
            const sortedTracks = _.sortBy(releaseTracks, "position");

            // Note: Only using a single artist credit
            const artistCredit = data["artist-credit"][0];
            const artistId = (artistCredit) ? artistCredit.artist.id : null;

            // Backaway if no name or tracks are found
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