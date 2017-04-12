var LineReader 	= require("line-by-line");
var Dispatch 	= require("./Dispatch.js");
var Logger 		= require("./Logger.js");

var data_file_path = "./data/mbrelease.tsv";
var lr = new LineReader(data_file_path);

var job_count = 0;
var batch_ids = [];

// LineReader "line" event handler
lr.on('line', function (row) {

	job_count++

	const [ 
		musicbrainz_release_id, 
		spotify_album_id
	] = row.split('\t');

	Dispatch.dispatchCrawlJob({
		namespace: "musicbrainz:release_id",
		data: { 
			musicbrainz_release_id, 
			spotify_album_id
		}
	});

	if (job_count % 10000 == 0) {
		Logger.info("Rows Completed: %d", job_count);
	}
	
});


lr.on('error', function (error) {
	Logger.error(error);
	process.exit();
});


lr.on('end', function () {

	if (batch_ids.length) {
		send_batch_album_ids();
	}

	setTimeout(shutdown_seeder, 3000);
});


var shutdown_seeder = function () {
	Logger.info("-- Job Creation Completed --");
	Logger.info("Total Job Count: %d", job_count);
	process.exit();
}