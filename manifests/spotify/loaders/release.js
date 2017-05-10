'use strict';


/*
    Spotify Release Crawl Seeder

    Executes seeder query and dispatches crawl jobs to the job queue. 
    Job processors will use Spotify Release ID or MixRadio Release Name
    to query the MusicBrainz Release API.
    
    Dependency: Spotify Release ID retrieved via Spotify Track Crawl
*/


/* Constants */
const namespace = "spotify:release";

/* Parse Job Metadata from text line */
const lineParser = (line) => {

    const attrs = line.split('\t');

    let jobMetadata = {}

    return jobMetadata;
}


module.exports = { namespace, lineParser };