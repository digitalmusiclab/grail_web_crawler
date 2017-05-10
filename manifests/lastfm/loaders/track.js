'use strict';


/*
    Last.fm Track Crawl Seeder

    Executes seeder query and dispatches crawl jobs to the job queue. 
    Job processors will use MusicBrainz Track ID or MusicBrainz Release 
    ID or MixRadio Track and Artist Name to query the Last.fm Track API.

    Data Columns = mixradio_release_ID | TRACK_JSON
    where TRACK_JSON = [{
        "position": "5", 
        "mr_track_id": "12342", 
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

    // Parse Line Data
    const mixradio_release_id = attrs[0];
    const tracks = JSON.parse(attrs[1]);

    // Create Jobs for Each Track from Track JSON
    const jobs = _.map(tracks, (track) => {
        
        const data = _.merge({ mixradio_release_id }, track);

        return { namespace, data };
    });


    return jobs;
}


module.exports = { namespace, lineParser };