'use strict';

// Load dependencies
const Logger = rootRequire('lib/logger');
const SpotifyApi = require('./../api');
const RateLimiter = rootRequire('lib/rate-limiter').Spotify;
const MixRadioArtist = rootRequire('manifests/mixradio/models').Artist;
const ArtistCriteriaMatch = rootRequire("criteria/artist");
const db = rootRequire("lib/database");
const _ = require("lodash");


/*
    Job Data = {
        sp_artist_id: "ABCEASYAS123",
        mr_artist_id: "0000001",
        mr_artist_name: "KURTBRADD",
        mr_artist_cardinality: 64
    }
*/
exports = module.exports = function process(job, done) {

    const { sp_artist_id } = job.data;

    const mr_artist = new MixRadioArtist(job.data);


    RateLimiter(process.pid, (error, timeLeft) => {

        if (error) {
            return done(error);
        }

        const sendRequest = function () {

            SpotifyApi.Artist.getById(sp_artist_id)
            .then( (sp_artist) => {
                return updateGrailArtist(mr_artist, sp_artist);
            })
            .then( () => {
                return done();
            })
            .catch( (error) => {
                return done(error);
            });
        };

        // Respect the rate limit before making the request
        const time = Number.parseInt(timeLeft, 10);
        const sleepTime = Math.max(time, 0);

        return setTimeout(sendRequest, sleepTime);
    });
};


const updateGrailArtist = (mr_artist, sp_artist) => {

    const criteriaScore = ArtistCriteriaMatch(mr_artist, sp_artist);

    return knex("grail_artist")
        .where('mixradio_artist_id', mr_artist.id)
        .andWhere('spotify_artist_id', sp_artist.id)
        .update({
            spotify_artist_name: sp_artist.name,
            spotify_artist_criteria: JSON.stringify(criteriaScore)
        });
};
