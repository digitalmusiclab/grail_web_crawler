var LineReader 	= require("line-by-line");
var Dispatch 	= require("./Dispatch.js");
var Logger 		= require("./Logger.js");


// File Path to Spotify Album IDs
// var data_file_path = "./data/spotAlbum_ids.csv";
// var data_file_path = "./data/spotify_album_ids01.txt";
// var data_file_path = "./data/spotify_album_ids.csv";
var data_file_path = "./data/uniq_album_ids.csv";
var lr = new LineReader(data_file_path);

var job_count = 0;
var line_count = 0;
var batch_ids = [];

// LineReader "line" event handler
lr.on('line', function (spotify_album_id) {

	line_count++
	batch_ids.push(spotify_album_id);
	
	if (batch_ids.length == 20) {
		send_batch_album_ids();
	}

	if (line_count % 10000 == 0) {
		Logger.info("Rows Completed: %d", line_count);
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
	Logger.info("Total Line Count: %d", line_count);
	process.exit();
}


var send_batch_album_ids = function () {
	job_count++
	Dispatch.dispatchCrawlJob({
		namespace: "spotify:album:ids",
		ids: batch_ids
	});
	batch_ids = [];
}