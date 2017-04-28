'use strict';

// Load dependencies
const Logger = require('./Logger');
const JobQueue = require('./JobQueue');

/**
 * Creates a job in the job queue with the given information.  Logs if the job
 * creation fails.  Returns nothing but an indicator that the job was created in
 * the job queue.
 * 
 * @param {string} name - The name of the job to create in the queue
 * @param {object} data - The payload to pass to the job processor
 * @param {string} priority - How important the job is in the grand scheme of things
 * @param {boolean} removeOnComplete - Whether the job is deleted after completion
 * @param {number} [attempts] - Number of attempts before failure
 * @param {number} [delay] - Milliseconds to delay between attempts
 * 
 * @return {void}
 */
function createJob(name, data, priority, removeOnComplete, attempts = 10, delay = 2000) {
  JobQueue.create(name, data)
    .priority(priority)
    .attempts(attempts)
    .backoff({ delay, type: 'fixed' })
    .removeOnComplete(removeOnComplete)
    .save(error => {
      if (error) {
        // Could not save to the queue.  Maybe Redis is down or the library has
        // a bug or we messed up.  Whatever the case log what happened.
        Logger.error('dispatch.createJob: %s, Job name: %s, Job data:', error, name, data);
      }
    });
}

/**
 * Dispatches a write job to the job queue.
 * 
 * @param {object} data - Contains schema information and the values to write
 * @return {void}
 */
exports.dispatchWriteJob = function dispatchWriteJob(data) {
  return createJob('database_writer', data, 'normal', true);
};

/**
 * Dispatches a crawl job based on the namespace provided.  Has knowledge of how
 * to handle the different crawl jobs that the application is capable of handling.
 * Creates a job in the job queue and returns when the job is created.
 * 
 * @param {object} data - Data to use for the job.  This data is structured on a
 *   job-by-job basis.  There is no specific format in general except that each
 *   data object will contain a
 * @param {string} data.namespace - The name of the crawl job that should be created
 * 
 * @return {void}
 */
exports.dispatchCrawlJob = function dispatchCrawlJob(data) {
  const namespace = data.namespace;

  // Initialize some common variables for each job handler
  let jobParameters;

  switch (namespace) {
    case 'spotify:trackByIsrc':
      jobParameters = { isrc: data.id };
      return createJob(namespace, jobParameters, 'high', true);

    case 'spotify:albumBySpotifyAlbumId':
      jobParameters = { id: data.id };
      return createJob(namespace, jobParameters, 'high', true);

    case 'spotify:albumsBySpotifyAlbumIds':
      jobParameters = { ids: data.ids };
      return createJob(namespace, jobParameters, 'high', true);

    case 'mb:releaseBySpotifyArtistAndAlbum':
      jobParameters = data.data;
      // We add attempts and delay for this specific job
      return createJob(namespace, jobParameters, 'high', true, 4000, 2000);

    default:
      // Someone gone and gave us an invalid job namespace, good grief
      Logger.debug('dispatchJobQueue: namespace not known', namespace);
      return null;
  }
};
