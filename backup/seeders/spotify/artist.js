'use strict';


/*
    Spotify Artist Crawl Seeder

    Executes seeder query and dispatches crawl jobs to the job queue. 
    Job processors will use Spotify Artist ID or MixRadio Artist Name
    to query the MusicBrainz Artist API.

    Dependency: Spotify Artist ID retrieved via Spotify Track Crawl
*/


/* Constants */
const namespace = "spotify:artist";

/* Parse Job Metadata from text line */
const lineParser = (line) => {

    const attrs = line.split('\t');

    let jobMetadata = {}

    return jobMetadata;
}


module.exports = { namespace, lineParser };