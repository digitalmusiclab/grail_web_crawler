'use strict';

/*
    MusicBrainz Release Crawl Seeder

    Executes seeder query and dispatches crawl jobs to the job queue. 
    Job processors will use MixRadio Artist Name, and Release Name to 
    query the MusicBrainz Release API.


    SCRIPT Data Columns
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


/* Constants */
const namespace = "musicbrainz:release";

/* Parse Job Metadata from text line */
const lineParser = (line) => {

    const attrs = line.split('\t');

    const data = {
        mr_release_id: attrs[0],
        mr_release_name: attrs[1],
        mr_release_cardinality: attrs[2],
        mr_artist_id: attrs[3],
        mr_artist_name: attrs[4],
        mb_release_id: attrs[5],
        mr_release_tracks: JSON.parse(attrs[6])
    };

    // NOTE: Force all release jobs to query by name
    // if (data.mb_release_id) {
    //     return { namespace: "musicbrainz:release:id", data };
    // }

    return { namespace: "musicbrainz:release:name", data };
};


module.exports = { namespace, lineParser };