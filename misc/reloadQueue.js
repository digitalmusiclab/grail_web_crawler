var redis = require ('redis'),
	kue = require ('kue');


var kue_params = {
	prefix: "crawler_kue",
	jobEvents: false,
	disableSearch: true,
	redis: {
			host: "0.0.0.0",
			port: 6379,
			db: 0,
			options: {}
	}
}

var Queue = kue.createQueue(kue_params);

// Find Job IDs for all Active Jobs
Queue.active(function (err, ids) {

	// Find Kue Job Reference via ID
	ids.forEach(function (id) {
		
		// Set Job state to Inactive
		kue.Job.get(id, function (err, job) {
			
			if (err) {
				return console.error(err);
			}

			console.log(job);

			job.inactive();
		});
	});
});