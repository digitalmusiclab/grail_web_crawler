var LineReader 	= require("line-by-line");
var Dispatch 	= require("./Dispatch.js");
var Logger 		= require("./Logger.js");


console.time("load-27M-isrc");

// File Path to ISRCs
var isrc_file_path = "./data/isrc.tsv";
var lr = new LineReader(isrc_file_path);

var job_count = 0;

// LineReader "line" event handler
lr.on('line', function (isrc) {
	
	job_count++
	
	// Dispatch a new crawljob for ISRC
	Dispatch.dispatchCrawlJob({
		namespace: "isrc",
		id: isrc
	});
	
	
	if (job_count % 10000 == 0) {
		Logger.info("Jobs Created: %d", job_count);
	}
	
});

lr.on('error', function (error) {
	Logger.error(error);
	process.exit();
});

lr.on('end', function () {
	Logger.info("Seed Job Creation Completed");
	Logger.info("Seed Job Count: %d", job_count);
	process.exit()
});