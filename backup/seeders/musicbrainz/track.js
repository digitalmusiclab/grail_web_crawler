'use strict';


/*
    MusicBrainz Track Crawl Seeder

    Executes seeder query and dispatches crawl jobs to the job queue. 
    Job processors will use MusicBrainz Track ID or MusicBrainz Release
    ID or MixRadio Track and Release and Artist Name to query the 
    MusicBrainz Track API.


    Manifest Columns = mixradio_track_ID | TRACK_JSON
    where,
    TRACK_JSON = [{
        "mr_track_id": "12342", 
        "musicbrainz_track_id": "NULL",
        "mr_track_name": "Sabotage",
        "mr_artist_name": "Beastie Boys",
        "mr_release_name": "Ill Communication",
        "position": "5",
    }]
*/


/* Constants */
const namespace = "musicbrainz:track";

/* Parse Job Metadata from text line */
const lineParser = (line) => {

    const attrs = line.split('\t');

    let jobMetadata = {
        mixradio_track_id: attrs[0],
        tracks: JSON.parse(attrs[1])
    }

    return jobMetadata;
}


module.exports = { namespace, lineParser };