'use strict';


/*
    Last.fm Track Crawl Seeder

    Executes seeder query and dispatches crawl jobs to the job queue. 
    Job processors will use MusicBrainz Track ID or MusicBrainz Release 
    ID or MixRadio Track and Artist Name to query the Last.fm Track API.

    Data Columns = mixradio_release_ID | TRACK_JSON
    where TRACK_JSON = [{
        "mr_track_id": "12342", 
        "position": "5", 
        "mr_track_name": "Sabotage",
        "mr_release_name":"Ill Communication",
        "mr_artist_name":"Beastie Boys",
        "musicbrainz_track_id": "NULL",
        "musicbrainz_artist_id": "454542",
        "lfm_track_id":"1234"
    }]
*/


/* Constants */
const namespace = "lastfm:track";

/* Parse Job Metadata from text line */
const lineParser = (line) => {

    const attrs = line.split('\t');

    const mixradio_release_id = attrs[0];
    const mixradio_release_tracks = JSON.parse(attrs[1]);

    let jobMetadata = {}

    return jobMetadata;
}


module.exports = { namespace, lineParser };