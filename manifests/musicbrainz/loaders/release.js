'use strict';

const _ = require("lodash");


/*
    MusicBrainz Release Crawl Seeder

    Executes seeder query and dispatches crawl jobs to the job queue. 
    Job processors will use MixRadio Artist Name, and Release Name to 
    query the MusicBrainz Release API.


    Data Columns = mr_release_id | RELEASE_TRACKS_JSON
    where,
    RELEASE_TRACKS_JSON = [{
        "mr_track_id":"1321455",
        "mr_track_name":"Lenny"
        "position":"6",
        "mr_release_name":"I Should Coco",
        "mr_release_cardinality":"13",
        "mr_artist_id":"10055880",
        "mr_artist_name":"Remember Me Soundtrack",
        "mb_release_id":"NULL",
        "mb_track_id":"NULL",
    }]
*/


/* Constants */
const namespace = "musicbrainz:release";

/* Parse Job Metadata from text line */
const lineParser = (line) => {

    const attrs = line.split('\t');

    let data = {
        mr_release_id: attrs[0],
        mr_release_tracks: JSON.parse(attrs[1])
    }

    return { namespace, data };
}


module.exports = { namespace, lineParser };