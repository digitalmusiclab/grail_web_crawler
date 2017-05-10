'use strict';

// Load dependencies
require("./lib/root-require")();
const cluster = require('cluster');
const JobQueue = rootRequire('lib/job-queue');
const Logger = rootRequire('lib/logger');

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

const LastFm = rootRequire('manifests/lastfm/processors');
const Spotify = rootRequire('manifests/spotify/processors');
const MusicBrainz = rootRequire('manifests/musicbrainz/processors');


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

// Spotify Processors
JobQueue.process('spotify:track', 1, Spotify.Track);
JobQueue.process('spotify:artist', 1, Spotify.Artist);
JobQueue.process('spotify:release', 1, Spotify.Release);

// MusicBrainz Processors
JobQueue.process('musicbrainz:track', 1, MusicBrainz.Track);
JobQueue.process('musicbrainz:artist', 1, MusicBrainz.Artist);
JobQueue.process('musicbrainz:release', 1, MusicBrainz.Release);

// // Last.fm Processors
JobQueue.process('lastfm:track', 1, LastFm.Track);
JobQueue.process('lastfm:artist', 1, LastFm.Artist);
JobQueue.process('lastfm:release', 1, LastFm.Release);