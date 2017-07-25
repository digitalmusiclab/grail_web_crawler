'use strict';

// Load dependencies
const Logger = require('./logger');
const JobQueue = require('./job-queue');

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
function createJob(name, data, priority, removeOnComplete, callback, attempts = 1, delay = 2000) {
    return JobQueue.create(name, data)
        .priority(priority)
        .attempts(attempts)
        .backoff({ delay, type: 'fixed' })
        .removeOnComplete(removeOnComplete)
        .save(callback);
}

function errorLogger(error) {
    if (error) {
        Logger.error('dispatch.createJob: %s', error);
    }
}

/**
 * Dispatches a write job to the job queue.
 * 
 * @param {object} data - Contains schema information and the values to write
 * @return {void}
 */
exports.dispatchWriteJob = function dispatchWriteJob(data) {
    return createJob('database_writer', data, 'normal', true, errorLogger);
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
exports.dispatchCrawlJob = function dispatchCrawlJob(job, callback) {
    return createJob(job.namespace, job.data, 'high', false, callback || errorLogger);
};



exports.dispatchCrawlJobPromise = function dispatchCrawlJobPromise(job) {

    return new Promise( (resolve, reject) => {

        this.dispatchCrawlJob(job, (error) => {
            
            if (error) {
                return reject(error);
            }

            return resolve();
        });

    });

};