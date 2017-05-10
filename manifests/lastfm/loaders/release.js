'use strict';


/*
    Last.fm Release Crawl Seeder

    Executes seeder query and dispatches crawl jobs to the job queue. 
    Job processors will use MusicBrainz Release ID or MixRadio Artist 
    and Release Name to query the Last.fm Release API.

    Data Columns = grail_release_ID | mixradio_release_ID | TRACK_JSON
    TRACK_JSON = [{
        "mr_track_id": "12342", 
        "position": "5", 
        "mr_track_name": "Sabotage",
        "mr_release_name": "Ill Communication",
        "mr_release_cardinality": "22",
        "mr_artist_name": "Beastie Boys",
        "musicbrainz_track_id": "NULL",
        "lfm_release_id":"1234"
    }]

*/


/* Constants */
const namespace = "lastfm:release";

/* Parse Job Metadata from text line */
const lineParser = (line) => {

    const attrs = line.split('\t');
    
    // Parse Line Data    
    const grail_release_id = attrs[0];
    const mixradio_release_id = attrs[1];
    const mixradio_release_tracks = JSON.parse(attrs[2]);

    // Job Metadata
    const data = { grail_release_id, mixradio_release_id, mixradio_release_tracks };

    return { namespace, data };
}


module.exports = { namespace, lineParser };