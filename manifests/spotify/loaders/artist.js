'use strict';

const _ = require("lodash");

/*
    Spotify Artist Crawl Seeder

    Executes seeder query and dispatches crawl jobs to the job queue.
    Job processors will use Spotify Artist ID or MixRadio Artist Name
    to query the MusicBrainz Artist API.

    Dependency: Spotify Artist ID retrieved via Spotify Track Crawl

    sp_artist_id: "ABCEASYAS123",
    {
        mr_artist_id: "0000001",
        mr_artist_name: "KURTBRADD",
        mr_artist_cardinality: 64
    }
*/


/* Constants */
const namespace = "spotify:artist";

/* Parse Job Metadata from text line */
const lineParser = (line) => {

    // Split Line Data
    const attrs = line.split('\t');

    // Parse Line Data
    const sp_artist_id = attrs[0];
    const mr_artists = JSON.parse(attrs[1]);

    // Create Jobs for Each Track from Track JSON
    const jobs = _.map(mr_artists, (artist) => {
        const data = _.merge({ sp_artist_id }, artist);
        return { namespace, data };
    });

    return jobs;
};


module.exports = { namespace, lineParser };
