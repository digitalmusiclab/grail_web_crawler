var LineReader 	= require("line-by-line");
var Dispatch 	= require("./Dispatch.js");
var Logger 		= require("./Logger.js");

var data_file_path = "./data/spotifyToMBunique.tsv";
var lr = new LineReader(data_file_path);

var job_count = 0;
var batch_ids = [];

// LineReader "line" event handler
lr.on('line', function (spotify_album) {

	job_count++

	var album_data = spotify_album.split('\t');

	const [ 
		spotify_album_id, 
		spotify_artist_name, 
		spotify_album_name, 
		spotify_album_cardinality 
	] = spotify_album.split('\t');

	Dispatch.dispatchCrawlJob({
		namespace: "spotify:album_id,track_name,album_name",
		data: { 
			spotify_album_id, 
			spotify_artist_name, 
			spotify_album_name, 
			spotify_album_cardinality 
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