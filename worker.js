'use strict';

// Load dependencies
const cluster = require('cluster');
const JobQueue = require('./lib/job-queue');
const Logger = require('./lib/logger');

if (cluster.worker) {
  Logger.info('Worker process #%d loaded', cluster.worker.id);
}

/**
 * Worker Processors
 * =================
 * 
 * These modules export functions that are able to process
 * jobs that are delivered through the JobQueue. The functions
 * they export are invoked with parameters for job metadata, and
 * a completion callback. 
 * 
 * When a processor finishes processing a job, the callback must be invoked. If t
 * he processor encounters an error while processing, an Error object can be passed 
 * as the first argument to the callback. Passing an error will notify the JobQueue 
 * to either reschedule the job, or mark the job as failed.
 */
const spotify = require('./processors/spotify-tracks-by-isrc');
const spotifyAlbum = require('./processors/spotify-albums-by-id');
const musicBrainzAlbum = require('./processors/music-brainz-album-by-spotify');

/**
 * JobQueue Router
 * ===============
 * 
 * The JobQueue can ingest many types of jobs, each with a unique name.
 * When the JobQueue delivers a job to be processed, a process function is
 * invoked with the job metadata. To notify the JobQueue that a job can be 
 * processed, JobQueue.process(), must be invoked with the following parameters.
 * 
 * 1. {string} - The name of the job
 * 2. {number} - How many jobs of this type can be processed at once
 * 3. {function} - How the job will be processed
 */
JobQueue.process('spotify:trackByIsrc', 8, spotify.trackByIsrc);
JobQueue.process('spotify:albumBySpotifyAlbumId', 8, spotifyAlbum.albumBySpotifyAlbumId);
JobQueue.process('spotify:albumsBySpotifyAlbumIds', 8, spotifyAlbum.albumsBySpotifyAlbumIds);
JobQueue.process(
  'mb:releaseBySpotifyArtistAndAlbum',
  8,
  musicBrainzAlbum.releaseBySpotifyArtistAndAlbum
);
