'use strict';

// Load dependencies
const request = require('request');
const baseUrl = require('./base-url');
const Config = rootRequire('config');



/*
    Get LastFm Release by MusicBrainz Release and Artist ID

    @param { string } musicbrainzReleaseId
    @param { string } musicbrainzArtistId

    @return { Promise.Array } MusicBrainzTrack
*/
module.getByMusicBrainzId = (musicbrainzReleaseId, musicbrainzArtistId) => {

    const requestParams = {
        baseUrl,
        qs: {
            api_key: Config.Keys.LastFm,
            format: "json",
            method: 'album.getinfo',
            artist: musicbrainzArtistId,
            album: musicbrainzReleaseId
        }
    };

    return sendRequest(requestParams);
};


module.getByName = (releaseName, artistName, callback) => {

    const requestParams = {
        baseUrl,
        qs: {
            api_key: Config.Keys.LastFm,
            format: "json",
            method: 'album.getinfo',
            artist: artistName,
            album: releaseName
        }
    };
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

const parseLastFmRelease = (data) => {

    return new Promise( (resolve, reject) => {

        const items = data.items;

        if (!items) {
            return reject(null);
        }

        // Parse Reponse Items into SpotifyTrack objects
        const spotifyTracks = _.map(items, (item) => {
            // return new SpotifyTrack(item);
        });

        return spotifyTracks;
    });
};
