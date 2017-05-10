'use strict';


/*
    MusicBrainz Artist Crawl Seeder

    Executes seeder query and dispatches crawl jobs to the job queue. 
    Job processors will use MusicBrainz Artist ID OR MixRadio Artist 
    Name to query the MusicBrainz Artist API.

    
    Data Columns = mixradio_artist_id | TRACK_JSON
    where,
    TRACK_JSON = [ { "mr_artist_name": "Chingy", "cardinality": "69", "mb_track_id": "123asc }, ... ]
*/


/* Constants */
const namespace = "musicbrainz:artist";

/* Parse Job Metadata from text line */
const lineParser = (line) => {

    const attrs = line.split('\t');

    let jobMetadata = {
        mixradio_artist_id: attrs[0],
        mixradio_artist_tracks: JSON.parse(attrs[1])
    }

    return jobMetadata;
}


module.exports = { namespace, lineParser };