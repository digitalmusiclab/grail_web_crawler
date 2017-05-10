'use strict';


/*
    MusicBrainz Release Crawl Seeder

    Executes seeder query and dispatches crawl jobs to the job queue. 
    Job processors will use MixRadio Artist Name, and Release Name to 
    query the MusicBrainz Release API.


    Data Columns = mixradio_release_ID | RELEASE_JSON
    where,
    RELEASE_JSON = [{
        "mr_track_id": "12342", 
        "position": "5", 
        "mr_track_name": "Sabotage",
        "mr_release_name":"Ill Communication",
        "mr_release_cardinality":"22",
        "mr_artist_name":
        "Beastie Boys",
        "musicbrainz_track_id": "NULL"
    }]
*/


/* Constants */
const namespace = "musicbrainz:release";

/* Parse Job Metadata from text line */
const lineParser = (line) => {

    const attrs = line.split('\t');

    let jobMetadata = {
        mixradio_release_id: attrs[0],
        mixradio_release_tracks: JSON.parse(attrs[1])
    }

    return jobMetadata;
}


module.exports = { namespace, lineParser };