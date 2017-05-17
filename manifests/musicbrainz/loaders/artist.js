'use strict';

const _ = require("lodash");

/*
    MusicBrainz Artist Crawl Seeder

    Executes seeder query and dispatches crawl jobs to the job queue. 
    Job processors will use MusicBrainz Artist ID OR MixRadio Artist 
    Name to query the MusicBrainz Artist API.

    
    Data Columns = mixradio_artist_id | TRACK_JSON
    where,
    TRACK_JSON = [ { "mr_artist_name": "Chingy", "cardinality": "69", "mb_artist_id": "123asc }, ... ]
*/


/* Constants */
const namespace = "musicbrainz:artist";

/* Parse Job Metadata from text line */
const lineParser = (line) => {

    const attrs = line.split('\t');

    const mr_artist_id = attrs[0];
    const mr_artists = JSON.parse(attrs[1])[0];



    // Create Jobs for Each Track from Track JSON
    const jobs = _.map(mr_artists, (artist) => {

        const data = _.merge({ mr_artist_id }, artist);

        return { namespace, data }
    });

    return jobs;
}


module.exports = { namespace, lineParser };