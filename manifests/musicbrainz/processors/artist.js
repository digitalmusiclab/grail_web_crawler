'use strict';

// Load dependencies
const Logger = rootRequire('lib/logger');
const MusicBrainz = require('./../api');
const RateLimiter = rootRequire('lib/rate-limiter').MusicBrainz;


/*
    job.data = { 
        mr_artist_id: '7',
        mr_artist_name: 'Something', 
        cardinality: '31', 
        mb_artist_id: 'NULL'
    }
*/


exports = module.exports = function process(job, done) {

    const { mb_artist_id, mr_artist_name, mr_artist_id, cardinality } = job.data;
    
    RateLimiter(process.pid, (error, timeLeft) => {

        // Rate limiter reported an error, exit immediately
        if (error) {
            return done(error);
        }

        // Send Request To MusicBrainz API
        const sendRequest = function () {

            if (!mb_artist_id) {
                return done();
            }

            let mb_artist = null;
            let mb_artist_criteria = null;
            getArtistInfoById(mb_artist_id)
            .then( ([name, cardinality]) => {

                mb_artist = new MusicBrainz.Artist({ name, cardinality });
                mb_artist_criteria = artist.criteraScore(job.data.mr_artist_name, job.data.cardinality);

                return checkArtistCount(mr_artist_id, mb_artist_id);
            })
            .then( (artistCount) => {
                if (artistCount == 0) {
                    return updateArtist(mr_artist_id, mb_artist.id, mb_artist_criteria);
                }

                return insertArtist(mr_artist_id, mb_artist.id, mb_artist_criteria);
            })
            .then( () => {
                return done();
            })
            .catch( (error) => {
                return done(error);
            });            
        }


        // Respect the rate limit before making the request
        const time = Number.parseInt(timeLeft, 10);
        const sleepTime = Math.max(time, 0);

        return setTimeout(sendRequest, sleepTime);
    });
};




const getArtistInfoById = (artistId) => {

    const artistName = getArtistNameById(artistId);
    const artistCardinality = getReleaseCardinalityById(artistId);

    return Promise.all([artistName, artistCardinality]);
}



// Promise Wrapper For MusicBrainz Artist Release Cardinality API
const getReleaseCardinalityById = (artistId) => {
    
    return new Promise( (resolve, reject) => {

        MusicBrainz.Artist.getReleaseCardinalityById(artistId, (err, cardinality) => {

            if (err) {
                return reject(err);
            }

            if (cardinality == undefined) {
                return reject(new Error("musicbrainz.artist: cardinality not found"));
            } 

            return resolve(cardinality);
        });
    });
}


// Promise Wrapper For MusicBrainz Artist Name API

const getArtistNameById = (artistId) => {
    
    return new Promise( (resolve, reject) => {

        MusicBrainz.Artist.getArtistNameById(artistId, (err, artistName) => {

            if (err) {
                return reject(err);
            }

            if (!artistName) {
                return reject(new Error("musicbrainz.artist: name not found"));
            }

            return resolve(artistName);
        });
    });
}





const checkArtistCount = (mixradio_artist_id, musicbrainz_artist_id) => {
    return knex('grail_artist')
        .whereNotNull('musicbrainz_artist_id')
        .whereNot('musicbrainz_artist_id', musicbrainz_artist_id)
        .where('mixradio_artist_id', mixradio_artist_id)
        .count("*");
}

const updateArtist = (mixradio_artist_id, musicbrainz_artist_id, musicbrainz_artist_criteria) => {
    return knex('grail_artist')
        .where("mixradio_artist_id", mixradio_artist_id)
        .update("musicbrainz_artist_id", musicbrainz_artist_id)
        .update("musicbrainz_artist_criteria", JSON.stringify(musicbrainz_artist_criteria));
}


const insertArtist = (mixradio_artist_id, musicbrainz_artist_id, musicbrainz_artist_criteria) => {

    const criteraJsonString = JSON.stringify(musicbrainz_artist_criteria);

    const sql = `
    INSERT INTO grail_artist(musicbrainz_artist_id,musicbrainz_artist_criteria,spotify_artist_id,spotify_artist_name,spotify_artist_criteria,facebook_artist_id,digital7_US_artist_id,digital7_UK_artist_id,digital7_AU_artist_id,openaura_artist_id,musixmatch_WW_artist_id,jambase_artist_id,fma_artist_id,seatgeek_artist_id,seatwave_artist_id,lyricfind_US_artist_id,rdio_artist_id,echonest_artist_id,twitter_artist_id,tumblr_artist_id,mixradio_artist_id,mixradio_artist_name,mixradio_artist_cardinality,lastfm_artist_id,lastfm_artist_criteria) 
    SELECT DISTINCT "${musicbrainz_artist_id}","${criteraJsonString}",spotify_artist_id,spotify_artist_name,spotify_artist_criteria,facebook_artist_id,digital7_US_artist_id,digital7_UK_artist_id,digital7_AU_artist_id,openaura_artist_id,musixmatch_WW_artist_id,jambase_artist_id,fma_artist_id,seatgeek_artist_id,seatwave_artist_id,lyricfind_US_artist_id,rdio_artist_id,echonest_artist_id,twitter_artist_id,tumblr_artist_id,mixradio_artist_id,mixradio_artist_name,mixradio_artist_cardinality,lastfm_artist_id,lastfm_artist_criteria 
    FROM grail.grail_artist 
    WHERE mixradio_artist_id = ${mixradio_artist_id};
    `
    
    return knex.raw(sql);
}