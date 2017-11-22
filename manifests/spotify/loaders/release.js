'use strict';


/*
    Spotify Release Crawl Seeder

    Executes seeder query and dispatches crawl jobs to the job queue.
    Job processors will use Spotify Release ID or MixRadio Release Name
    to query the MusicBrainz Release API.

    Dependency: Spotify Release ID retrieved via Spotify Track Crawl

    SCRIPT Data Columns
    ===================================
    sp_realease_id: "123abc",
    mr_release_id: "abc_easy_as_123",
    mr_release_name: "12345",
    mr_release_cardinality: 12,
    mr_release_tracks: [{
        "mr_track_id": "12342",
        "mr_track_name": "Sabotage",
        "mr_track_position": "5"
    }]
    ===================================
*/


/* Constants */
const namespace = "spotify:release";

/* Parse Job Metadata from text line */
const lineParser = (line) => {

    const attrs = line.split('\t');

    // Parse Line Data
    const data = {
        sp_realease_id: attrs[0],
        mr_release_id: attrs[1],
        mr_release_name: attrs[2],
        mr_release_cardinality: attrs[3],
        mr_release_tracks: JSON.parse(attrs[4])
    };

    return { namespace, data };
};


module.exports = { namespace, lineParser };
