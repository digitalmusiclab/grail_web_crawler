'use strict';


/*
    Last.fm Release Crawl Seeder

    Executes seeder query and dispatches crawl jobs to the job queue. 
    Job processors will use MusicBrainz Release ID or MixRadio Artist 
    and Release Name to query the Last.fm Release API.

    SCRIPT Data Columns
    ===================================
    mb_realease_id: String,
    mb_artist_id: String
    mr_release_id: String,
    mr_release_name: Integer,
    mr_release_cardinality: Integer,
    mr_release_tracks: [{
        "mr_track_id": Integer,
        "mr_track_name": String,
        "mr_track_position": Integer,
        "mb_track_id": String,
    }]
    ===================================
*/


/* Constants */
const namespace = "lastfm:release";

/* Parse Job Metadata from text line */
const lineParser = (line) => {

    const attrs = line.split('\t');
    
    // Parse Line Data    
    const data = {
        mb_release_id: attrs[0],
        mb_artist_id: attrs[1],
        mr_release_id: attrs[2],
        mr_release_name: attrs[3],
        mr_release_cardinality: attrs[4],
        mr_release_tracks: JSON.parse(attrs[5])
    }

    return { namespace, data };
}


module.exports = { namespace, lineParser };