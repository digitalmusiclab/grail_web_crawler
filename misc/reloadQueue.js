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

// Queue.failed(function (err, ids) {
// 	ids.forEach(function (id) {
// 		kue.Job.get(id, function (err, job) {
// 			if (err) {
// 				return console.error(err);
// 			}
// 			job.inactive();
// 		})
// 	})
// })

Queue.active(function (err, ids) {
	ids.forEach(function (id) {
		kue.Job.get(id, function (err, job) {
			if (err) {
				return console.error(err);
			}
			job.inactive();
		})
	})
})

// Queue.delayed(function (err, ids) {
// 	ids.forEach(function (id) {
// 		kue.Job.get(id, function (err, job) {
// 			if (err) {
// 				return console.error(err);
// 			}
// 			job.inactive();
// 		})
// 	})
// })
