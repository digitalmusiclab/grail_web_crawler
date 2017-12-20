'use strict';


/*
    Spotify Track Crawl Seeder

    Executes seeder query and dispatches crawl jobs to the job queue.
    Job processors will use an ISRC to query the Spotify Track API.

    Manifest Columns = ISRC | TRACK_JSON
    where,
    TRACK_JSON = [{
        "mr_track_id": "12342",
        "mr_track_name": "Sabotage",
        "mr_track_position": "5",
        "mr_release_id": "12342",
        "mr_artist_id": "12342",
        "sp_track_id": "ABCD1234"
    }]
*/


/* Job Namespace */
const namespace = "spotify:track";

/* Parse Job Metadata from text line */
const lineParser = (line) => {

    const attrs = line.split('\t');

    const isrc = attrs[0];
    const tracks = JSON.parse(attrs[1]);

    const data = { isrc, tracks };

    return { namespace, data };
};


module.exports = { namespace, lineParser };
