'use strict';


/*
    Last.fm Artist Crawl Seeder

    Executes seeder query and dispatches crawl jobs to the job queue. 
    Job processors will use MusicBrainz Artist ID or MixRadio Artist 
    Name to query the Last.fm Artist API.

    Data Columns = grail_release_ID | mixradio_release_ID | ARTIST_JSON
    ARTIST_JSON = [{
        "mr_artist_name": "Chingy", 
        "cardinality": "69", 
        "mb_track_id": "123asc
    }]
*/


/* Constants */
const namespace = "lastfm:artist";

/* Parse Job Metadata from text line */
const lineParser = (line) => {

    const attrs = line.split('\t');

    // Parse Line Data
    const grail_release_id = attrs[0];
    const mixradio_release_id = attrs[1];
    const mixradio_artist_tracks = JSON.parse(attrs[2]);

    // Job Metadata
    const data = { grail_release_id, mixradio_release_id, mixradio_artist_tracks };

    return { namespace, data };
}


module.exports = { namespace, lineParser };