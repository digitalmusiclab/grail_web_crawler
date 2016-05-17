var cluster = require('cluster');
var numCPUs = require('os').cpus().length;
var Logger 	= require("./Logger.js");

// 3425376
var isrc_line_size = 27403008;
var batch_size = isrc_line_size / numCPUs;

// Load Master Process
if (cluster.isMaster) {

	var creation_stats = [];

	for (var i = 0; i < numCPUs; i++) {

		var worker = cluster.fork();

		creation_stats[worker.id - 1] = 0;

		worker.on('message', function(data) {
			var worker = this;
			creation_stats[worker.id - 1] = data.job_count;

			var total_jobs_complete = creation_stats.reduce((prev, curr) => prev + curr);

			Logger.info("Total Jobs Created: %d", total_jobs_complete);
			Logger.info(creation_stats);
		});

	}

	cluster.on('exit', function(worker) {
		Logger.error('Worker ' + worker.id + ' died.');
	});

}
// Load Worker Process
else {

	var LineReader 	= require("line-by-line");
	var Dispatch 	= require("./Dispatch.js");
	
	var worker_num 	= parseInt(cluster.worker.id) - 1;
	var start_line 	= batch_size * worker_num;
	var end_line 	= start_line + batch_size - 1;
	
	var isrc_path_components = ["./data/isrc_split_", worker_num, ".tsv"];
	var isrc_file_path = isrc_path_components.join("");
	// var isrc_file_path 	= "./data/isrc.tsv";
	
	var lr_opts = {
		encoding: 'utf8',
		skipEmptyLines: true,
		start: start_line,
		end: end_line
	}

	var lr = new LineReader(isrc_file_path);

	var job_count = 0;

	lr.on('line', function (isrc) {
	
		job_count++
		
		// Dispatch a new crawljob for ISRC
		Dispatch.dispatchCrawlJob({
			namespace: "isrc",
			id: isrc
		});
		
		
		if (job_count % 100000 == 0) {
			process.send({job_count: job_count});
		}
		
	});

	lr.on('error', function (error) {
		Logger.error(error);
	});

	lr.on('end', function () {
		Logger.info("[Worker %d] - Seed Job Creation Completed", worker_num);
		Logger.info("[Worker %d] - Seed Job Count: %d/%d", worker_num, job_count, batch_size);
		process.send({job_count: job_count});
	});

	console.log("Worker: %d [%d, %d]", worker_num, start_line, end_line);


}