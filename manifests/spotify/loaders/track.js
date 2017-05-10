'use strict';


/*
    Spotify Track Crawl Seeder

    Executes seeder query and dispatches crawl jobs to the job queue. 
    Job processors will use an ISRC to query the Spotify Track API.
*/


/* Job Namespace */
const namespace = "spotify:track";

/* Parse Job Metadata from text line */
const lineParser = (line) => {

    const attrs = line.split('\t');

    let jobMetadata = {}

    return jobMetadata;
}


module.exports = { namespace, lineParser };