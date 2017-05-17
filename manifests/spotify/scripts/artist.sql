-- CHECKS Spotify ARTIST DATA
	-- Gets Spotify Artist IDs with Spotify ID
	-- API Parameters: spotify artist IDs (when available)
	-- API REQUEST: https://api.spotify.com/v1/artists/spotify_artist_id/album
	-- Manifest Columns = mixradio_artist_ID | ARTIST JSON
		-- JSON track format = [ {"mr_artist_name": "Chingy", "cardinality": "69", "sp_artist_id": "123asc}, ... ]


SET SESSION group_concat_max_len = 1000000;
SELECT DISTINCT ga.mixradio_artist_id as mr_artist_id,
	CONCAT('[',GROUP_CONCAT(DISTINCT CONCAT('{
		\"mr_artist_name\":\"',ga.mixradio_artist_name,'\",
		\"cardinality\":\"',ga.mixradio_artist_cardinality,'\",
		\"sp_artist_id\":\"',IF(ga.spotify_artist_id IS NULL, "NULL",gr.musicbrainz_artist_id),'\"}')),']') as artistSeed
FROM 
	grail.grail_track as gt, 
	grail.grail_artist as ga, 
	grail.grail_release as gr 
WHERE 
	gt.grail_track_id = ga.grail_artist_id 
AND gr.grail_release_id = gt.grail_release_id 
GROUP BY ga.mixradio_artist_id;

-- CHECK ARTIST: SELECT count(*) FROM grail_artist WHERE spotify_artist_id != "SPOTIFY_artist_ID" AND spotify_artist_id IS NOT NULL AND mixradio_artist_id = MIXRADIO_ARTIST_ID;
	-- UPDATE ARTIST (if CHECK == 0):
		-- UPDATE grail.grail_artist SET grail.grail_artist.spotify_artist_id = "MATCHED_SPOTIFY_ARTIST_ID", grail.grail_artist.spotify_artist_criteria = "SPOTIFY_CRITERIA_JSON" WHERE grail.grail_artist.mixradio_artist_id = MIXRADIO_ARTIST_ID	
	-- INSERT ARTIST (if CHECK > 0):
		-- INSERT INTO grail_artist(spotify_artist_id,spotify_artist_criteria,createdat_artist,musicbrainz_artist_id,musicbrainz_artist_name,musicbrainz_artist_criteria,facebook_artist_id,digital7_US_artist_id,digital7_UK_artist_id,digital7_AU_artist_id,openaura_artist_id,musixmatch_WW_artist_id,jambase_artist_id,fma_artist_id,seatgeek_artist_id,seatwave_artist_id,lyricfind_US_artist_id,rdio_artist_id,echonest_artist_id,twitter_artist_id,tumblr_artist_id,mixradio_artist_id,mixradio_artist_name,mixradio_artist_cardinality,lastfm_artist_id,lastfm_artist_criteria)
	 		-- SELECT DISTINCT "NEW SPOTIFY ARTIST ID","SPOTIFY JSON_CRITERIA","NEW CREATE TIMESTAMP",musicbrainz_artist_id,musicbrainz_artist_criteria,facebook_artist_id,digital7_US_artist_id,digital7_UK_artist_id,digital7_AU_artist_id,openaura_artist_id,musixmatch_WW_artist_id,jambase_artist_id,fma_artist_id,seatgeek_artist_id,seatwave_artist_id,lyricfind_US_artist_id,rdio_artist_id,echonest_artist_id,twitter_artist_id,tumblr_artist_id,mixradio_artist_id,mixradio_artist_name,mixradio_artist_cardinality,lastfm_artist_id,lastfm_artist_criteria
	 		-- FROM grail.grail_artist WHERE mixradio_artist_id = MIXRADIO ARTIST;
