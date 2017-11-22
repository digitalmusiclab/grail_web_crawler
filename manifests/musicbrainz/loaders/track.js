'use strict';

const _ = require("lodash");


/*
    MusicBrainz Track Crawl Seeder

    Executes seeder query and dispatches crawl jobs to the job queue.
    Job processors will use MusicBrainz Track ID or MusicBrainz Release
    ID or MixRadio Track and Release and Artist Name to query the
    MusicBrainz Track API.


    Manifest Columns = mr_track_id | TRACK_JSON
    where,
    TRACK_JSON = [{
        "position":"1",
        "mr_track_name":"I`d Like To Know",
        "mr_artist_name":"Remember Me Soundtrack",
        "mr_release_name":"I Should Coco",
        "mb_track_id":"NULL",
        "mb_release_id":"NULL"
    }]
*/


/* Constants */
const namespace = "musicbrainz:track";

/* Parse Job Metadata from text line */
const lineParser = (line) => {

    const attrs = line.split('\t');

    // Parse Line Data
    const mr_track_id = attrs[0];
    const tracks = JSON.parse(attrs[1]);

    // Create Jobs for Each Track from Track JSON
    const jobs = _.map(tracks, (track) => {

        const data = _.merge({ mr_track_id }, track);

        return { namespace, data };
    });

    return jobs;
};


module.exports = { namespace, lineParser };
