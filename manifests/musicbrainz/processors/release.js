'use strict';

// Load dependencies
const Logger = rootRequire('lib/logger');
const MusicBrainz = require('./../api');
const RateLimiter = rootRequire('lib/rate-limiter').MusicBrainz;
const MixRadioRelease = rootRequire('manifests/mixradio/models').Release;
const ReleaseCriteria = rootRequire('criteria/release');
const _ = require("lodash");

/*
    job.data = {
        mr_release_id: 1321422,
        mr_release_name: "I Should Coco",
        mr_release_cardinality: "13",
        mr_artist_id: "10055880",
        mr_artist_name: "Remember Me Soundtrack",
        mr_release_tracks: [{
            "mr_track_id": "1321455",
            "mr_track_name": "Lenny"
            "mr_track_position": "6",
            "mb_track_id": "NULL",
            "mb_release_id": "NULL"
        }]
    }
*/

exports = module.exports = function process(job, done) {

    const mixradioRelease = new MixRadioRelease(job.data);
    

    RateLimiter(process.pid, (error, timeLeft) => {

        // Rate limiter reported an error, exit immediately
        if (error) {
            return done(error);
        }

        // Request Completion Handler
        const requestCompletionHandler = function (error, data) {

            // Unable to retrieve the metadata (could be rate limit)
            if (error) {
                Logger.info('musicbrainz.release: failed', error);
                return done(error);
            }

            // There is no metadata, we are done
            if (!data) {
                return done();
            }

            // Serialize metadata into a `MusicBrainzRelease` and log
            // const album = new MusicBrainzRelease(data);
            Logger.info('musicbrainz.release: ', data);

            return done();
        }


        // Send Request To MusicBrainz API
        const sendRequest = function () {
            getReleases(job.data)
            .then( (release) => {

                if (!release) {
                    return Promise.reject();
                }
                // compute criteria score
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



const getReleases = (data) => {

    return Promise.resolve().then( () => {
        
        if (data.mb_release_id) {
            return getReleaseById(id);
        }

        return getReleaseByName(data.mr_release_name, data.mr_artist_name);
    })
    .then( (releaseData) => {

        if (typeof releaseData == 'array') {
            return releaseData;
        }

        if (typeof releaseData == 'object') {
            return [releaseData];
        }

        return Promise.reject(null);
    });
    .then( (releases) => {
        return updateGrailWithReleases()
    });
}



const updateGrailWithReleases = (mixradio_release, musicbrainz_releases) => {

}

const updateGrailWithRelease = (mr_release, mb_release) => {

    const criteriaScore = ReleaseCriteria.criteriaScore(mr_release, mb_release);

    const releasePromise = checkReleaseCount(mr_release.id, mb_release.id)
        .then( (count) => {
            if (count > 0) {
                return updateRelease(mr_release.id, mb_release.id, criteriaScore);
            }
            return insertRelease(mb_release.id, criteriaScore);
        });

    const artistPromise = checkArtistCount(mr_release.artist_id, mb_release.artist_id)
        .then( (count) => {
            if (count == 0) {
                return updateArtist(mr_release.artist_id, mb_release.artist_id);
            }
            return insertArtist(mb_release.artist_id);
        });

    return Promise.all([releasePromise, artistPromise])
        .then( ([grail_release_id, grail_artist_id]) => {

            if (releaseResult &&) {
                return updateTrack(grail_release_id, grail_artist_id, mr_track_ids);
            }

        });
}




//////////////////////////////////////////////////////////////////////////////////////////
// Helpers: API Promise Wrappers
//////////////////////////////////////////////////////////////////////////////////////////

// Promise Wrapper For MusicBrainz Artist Release Cardinality API
// Returns a single MusicBrainz Release Object
const getReleaseById = (id) => {
    
    return new Promise( (resolve, reject) => {

        MusicBrainz.Release.getById(id, (err, release) => {

            if (err) {
                return reject(err);
            }

            return resolve(release);
        });
    });
}


// Promise Wrapper For MusicBrainz Artist Name API
// Returns multiple MusicBrainz Release Objects
const getReleaseByName = (releaseName, artistName) => {
    
    return MusicBrainz.Release.getByName(releaseName, artistName, (err, releases) => {

        if (err) {
            return reject(err);
        }

        if (!releases) {
            return reject(null);
        }

        // Map MusicBrainz Release Objects to Promises for RealeaseById Requests
        const releasePromises = _.map(releases, (release) => {
            return getReleaseById(release.id);
        });

        return Promise.all(releasePromises);
    });

}



//////////////////////////////////////////////////////////////////////////////////////////
// Release: Check / Update / Insert
//////////////////////////////////////////////////////////////////////////////////////////

const checkReleaseCount = (mixradio_release_id, musicbrainz_release_id) => {

    return knex("grail_release")
        .where(function() {
          this.where('musicbrainz_release_id', musicbrainz_release_id).orWhereNull("musicbrainz_release_id")
        })
        .andWhere("mixradio_release_id", mixradio_release_id)
        .count("*");
}


const updateRelease = (mixradio_release_id, musicbrainz_release_id, musicbrainz_release_criteria) => {

    musicbrainz_release_criteria = JSON.stringify(musicbrainz_release_criteria);

    return knex("grail_release")
        .where(function() {
          this.where('musicbrainz_release_id', musicbrainz_release_id).orWhereNull("musicbrainz_release_id")
        })
        .andWhere("mixradio_release_id", mixradio_release_id)
        .update({ musicbrainz_release_id, musicbrainz_release_criteria });
}


const insertRelease = (mixradio_release_id, musicbrainz_release_id, musicbrainz_release_criteria) => {

    musicbrainz_release_criteria = JSON.stringify(musicbrainz_release_criteria);

    // Distinct columns to merge with new attributes for insert into Grail Release
    const distinctColumns = [
        "spotify_release_id", "spotify_release_criteria",
        "mixradio_release_id", "mixradio_release_name", "mixradio_release_cardinality"
    ];

    return knex("grail_release")
    .distinct(distinctColumns)
    .where('mixradio_release_id', mixradio_release_id)
    .then( (distinctReleases) => {
        // Merge Distinct Attributes with new MusicBrainz Attributes
        return _.map(distinctReleases, (release) => {
            return _.merge(release, { musicbrainz_release_id, musicbrainz_release_criteria });
        });
    })
    .then( (newReleases) => {
        const chunkSize = newReleases.length;
        return knex.batchInsert('grail_release', newReleases, chunkSize);
    });
}


//////////////////////////////////////////////////////////////////////////////////////////
// Artist: Check / Update / Insert
//////////////////////////////////////////////////////////////////////////////////////////


const checkArtistCount = (mixradio_artist_id, musicbrainz_artist_id) => {
    
    const sql = `
    SELECT count(*) 
    FROM grail_release as gr, grail_artist as ga, grail_track 
    WHERE ga.mixradio_artist_id = "${mixradio_artist_id}" 
    AND ga.musicbrainz_artist_id != "${musicbrainz_artist_id}" 
    AND gt.grail_artist_id = ga.grail_artist_id 
    AND gt.grail_release_id = gr.grail_release_id;
    `

    return knex.raw(sql);
}



/*
    Returns an array of grail_artist_ids for the Artist rows that have been updated
*/
const updateArtist = (mixradio_artist_id, musicbrainz_artist_id) => {

    return knex.transaction( (trx) => {

        return trx("grail_artist")
        .select(["grail_artist_id"])
        .where("mixradio_artist_id", mixradio_artist_id)
        .pluck("grail_artist_id")
        .then( (grail_artist_ids) => {
            return trx("grail_artist")
                .update("musicbrainz_artist_id", musicbrainz_artist_id)
                .whereIn('grail_artist_id', grail_artist_ids)
                .then(() => grail_artist_ids);
        })
    });
}


/*
    Returns the newly inserted Grail Artist ID
*/
const insertArtist = (musicbrainz_artist_id) => {

    const createdDate = new Date()

    const sql = `
    INSERT INTO grail_artist(musicbrainz_artist_id,createdat_artist,spotify_artist_id,spotify_artist_name,spotify_artist_criteria,facebook_artist_id,digital7_US_artist_id,digital7_UK_artist_id,digital7_AU_artist_id,openaura_artist_id,musixmatch_WW_artist_id,jambase_artist_id,fma_artist_id,seatgeek_artist_id,seatwave_artist_id,lyricfind_US_artist_id,rdio_artist_id,echonest_artist_id,twitter_artist_id,tumblr_artist_id,musicbrainz_artist_criteria,mixradio_artist_id,mixradio_artist_name,mixradio_artist_cardinality,lastfm_artist_id,lastfm_artist_criteria) 
    SELECT DISTINCT "${musicbrainz_artist_id}", "${createdDate}",spotify_artist_id,spotify_artist_name,spotify_artist_criteria,facebook_artist_id,digital7_US_artist_id,digital7_UK_artist_id,digital7_AU_artist_id,openaura_artist_id,musixmatch_WW_artist_id,jambase_artist_id,fma_artist_id,seatgeek_artist_id,seatwave_artist_id,lyricfind_US_artist_id,rdio_artist_id,echonest_artist_id,twitter_artist_id,tumblr_artist_id,musicbrainz_artist_criteria,mixradio_artist_id,mixradio_artist_name,mixradio_artist_cardinality,lastfm_artist_id,lastfm_artist_criteria 
    FROM grail_artist;
    SELECT max(grail_artist_id) FROM grail.grail_artist;
    `
    
    return knex.raw(sql);
}


//////////////////////////////////////////////////////////////////////////////////////////
// Track: Update
//////////////////////////////////////////////////////////////////////////////////////////

const updateTrack = (grail_release_id, grail_artist_id, mr_artist_id, mr_track_ids) => {

    const sql = `
    INSERT INTO grail.grail_track(grail_release_id,grail_artist_id,musicbrainz_track_id,isrc,spotify_track_id,spotify_track_name,spotify_track_criteria,musicbrainz_track_id,musicbrainz_track_criteria2,echonest_track_id,lyricfind_US_track_id,musixmatch_track_id,mixradio_track_id,mixradio_track_name,mixradio_track_position,msd_track_id,lastfm_track_id,lastfm_track_criteria,createdat_track) 
    SELECT DISTINCT "${grail_release_id}", "${grail_artist_id}",gt.musicbrainz_track_id,gt.isrc,gt.spotify_track_id,gt.spotify_track_name,gt.spotify_track_criteria,gt.musicbrainz_track_id,gt.musicbrainz_track_criteria2,gt.echonest_track_id,gt.lyricfind_US_track_id,gt.musixmatch_track_id,gt.mixradio_track_id,gt.mixradio_track_name,gt.mixradio_track_position,gt.msd_track_id,gt.lastfm_track_id,gt.lastfm_track_criteria,gt.createdat_track 
    FROM grail.grail_track as gt, grail.grail_artist as ga 
    WHERE gt.mixradio_track_id IN (${mr_track_ids}) 
    AND ga.mixradio_artist_id = ${mr_artist_id} 
    AND ga.grail_artist_id = gt.grail_artist_id;
    `

    return knex.raw(sql);
}