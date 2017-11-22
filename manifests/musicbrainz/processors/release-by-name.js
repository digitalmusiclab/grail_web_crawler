'use strict';

// Load dependencies
const Sleep = rootRequire('lib/sleep');
const MusicBrainz = require('./../api');
const Dispatcher = rootRequire('lib/dispatch');
const RateLimiter = rootRequire('lib/rate-limiter').MusicBrainz;
const _ = require("lodash");

/*
    Job Data JSON Object
    ===================================
    mr_release_id: 1321422,
    mr_release_name: "I Should Coco",
    mr_release_cardinality: "13",
    mr_artist_id: "10055880",
    mr_artist_name: "Remember Me Soundtrack",
    mb_release_id: "NULL",
    mr_release_tracks: [{
        "mr_track_id": "1321455",
        "mr_track_name": "Lenny",
        "mr_track_position": "6",
        "mb_track_id": "NULL"
    }]
    ===================================
*/

exports = module.exports = function process(job, done) {

    // Respect the rate limit before making the request
    RateLimiter(process.pid, (error, timeLeft) => {

        // Rate limiter reported an error, exit immediately
        if (error) {
            return done(error);
        }

        Sleep(timeLeft)
        .then( () => {
            return MusicBrainz.Release.getByName(job.data.mr_release_name, job.data.mr_artist_name);
        })
        .then( (musicbrainzReleases) => {
            return dispatchReleaseByIdJobsFor(job.data, musicbrainzReleases);
        })
        .then( (result) => {
            return done(null, result);
        })
        .catch( (error) => {
            return done(error);
        });
    });
};


/* Sequentially update Grail with returned MusicBrainz Releases */
const dispatchReleaseByIdJobsFor = (metadata, musicbrainz_releases) => {

    let promise = Promise.resolve();

    _.each(musicbrainz_releases, (mb_release) => {
        promise = promise.then( () => {
            return dispatchReleaseByIdJob(metadata, mb_release.id);
        });
    });

    return promise;
};


const dispatchReleaseByIdJob = (metadata, mb_release_id) => {
    const namespace = "musicbrainz:release:id";
    const data = _.assign(metadata, { mb_release_id });
    return Dispatcher.dispatchCrawlJobPromise({ namespace, data });
};
