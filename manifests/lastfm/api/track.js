'use strict';

// Load dependencies
const _ = require('lodash');
const request = require('request');
const baseUrl = require('./base-url');
const LastFmTrack = require("./../models/track");
const Config = rootRequire('config');




/*
    Get LastFM Track By MusicBrainz Track and Artist ID

    @param { sting } musicbrainzTrackId
    @param { sting } musicbrainzArtistId

    @return { Promise.Array } LastFmTrack
*/
exports.getByMusicBrainzId = (musicbrainzTrackId, musicbrainzArtistId) => {

    const requestParams = {
        baseUrl,
        qs: {
            api_key: Config.Keys.LastFm,
            format: "json",
            method: 'track.getinfo',
            artist: musicbrainzArtistId,
            track: musicbrainzTrackId
        }
    };

    return sendRequest(requestParams);
};




exports.getByName = (artistName, trackName, callback) => {

    const requestParams = {
        baseUrl,
        qs: {
            api_key: Config.Keys.LastFm,
            format: "json",
            method: "track.getinfo",
            artist: artistName,
            track: trackName
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

const parseLastFMTrack = (data) => {

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
