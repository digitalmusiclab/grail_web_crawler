# grail_web_crawler


Master
- dispatches jobs to the job queue

Worker
- plucks jobs from job queue
- routes jobs to correct job processor (all works can process all jobs)
- job processor calls the correct api
- job processor dispatches "db write job" with the computed results