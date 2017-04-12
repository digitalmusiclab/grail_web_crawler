var env = process.env.NODE_ENV || "development",
	kue_config = require("../config/secrets.js")[env].queue.kue,
	redis = require ('redis'),
	kue = require ('kue'),
	Queue = kue.createQueue(kue_config),
	fs = require('fs')
	file = fs.createWriteStream('./failed_jobs.tsv');

var first_line_written = false;
var row_column_header = [];
var get_job_count = 0;
var write_line_count = 0;

// File Writer Error Handler
file.on('error', console.error);


// Get Failed Jobs
Queue.failed(function (err, ids) {
	
	console.log(`num ids: ${ids.length}`)

	var promise = Promise.resolve();

	ids.forEach(function (id) {

		promise = promise.then(function () {
			return getJob(id).then(function (job) {
				writeJobToFile(job.type, job.data);
			});
		});

	});

	promise.then(function () {
		console.log("Done");
		console.log(`jobs: ${get_job_count} lines: ${write_line_count}`);
		file.end();
		process.exit();
	});

});

getJob = function (id) {

	++get_job_count

	return new Promise( (resolve, reject) => {

		kue.Job.get(id, function (err, job) {
			if (err) {
				console.error(err);
			}
			return resolve(job);
		});

	});
}


writeJobToFile = function (job_type, job_data) {
	
	++write_line_count

	if (!first_line_written) {
		writeHeaderToFile(job_type, job_data);
	}
	
	var line_items = [];

	row_column_header.forEach( function (column) {
		line_items.push(job_data[column]);
	});

	var line = line_items.join("\t");
	
	file.write(`${line}\n`);
}

writeHeaderToFile = function (job_type, job_data) {
	var line_items = []
	
	for (let key in job_data) {
		line_items.push(key);
		row_column_header.push(key);
	}

	var data_header = line_items.join("\t");
	
	file.write(`Job Type: ${job_type}\n\n`);

	file.write(`${data_header}\n\n`);

	first_line_written = true;
}
