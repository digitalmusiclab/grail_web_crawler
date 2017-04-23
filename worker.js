'use strict';

// Load dependencies
const cluster = require('cluster');
const JobQueue = require('./lib/JobQueue.js');
const Logger = require('./lib/Logger.js');

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
const Spotify = require('./processors/Spotify.js');
const SpotifyAlbum = require('./processors/SpotifyAlbum.js');
const Echonest = require('./processors/Echonest.js');
const DatabaseWriter = require('./processors/DatabaseWriter.js');
const MBReleaseSPAlbum = require('./processors/MBReleaseSPAlbum.js');

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
JobQueue.process('database_writer', 8, DatabaseWriter.processJob);
JobQueue.process('spotify_track_by_isrc', 8, Spotify.trackByIsrc);
JobQueue.process('spotify_album_by_spotify_album_id', 8, SpotifyAlbum.albumBySpotifyAlbumId);
JobQueue.process('spotify_album_by_spotify_album_ids', 8, SpotifyAlbum.albumsBySpotifyAlbumIds);
JobQueue.process('echonest_track_by_spotify_track', 1, Echonest.echonest_track_by_spotify_track);
JobQueue.process(
  'mb_release_by_sp_artist_album',
  8,
  MBReleaseSPAlbum.musicbrainz_release_by_spotify_artist_album
);
