-- CHECKS Spotify RELEASE DATA
	-- Gets Spotify RELEASE IDs with Spotify ID
	-- API Parameters: spotify RELEASE IDs (when available)
	-- API REQUEST: https://api.spotify.com/v1/album/spotify_release
	-- Manifest Columns = grail_release_ID | mixradio_release_ID | Track JSON
		-- JSON track format = [ {"mr_track_id": "12342", "position": "5", "mr_track_name": "Sabotage","mr_release_name":"Ill Communication","mr_release_cardinality":"22","mr_artist_name":"Beastie Boys",mr_artist_id=1235}, ... ]

SET SESSION group_concat_max_len = 1000000;

SELECT DISTINCT
	gr.mixradio_release_id as mr_release_id,
	CONCAT('[',	GROUP_CONCAT(DISTINCT CONCAT('{
		\"mr_track_id\":\"',gt.mixradio_track_id,'\", 
		\"position\":\"',gt.mixradio_track_position,'\",
		\"mr_release_name\":\"',gr.mixradio_release_name,'\",
		\"mr_release_cardinality\":\"',gr.mixradio_release_cardinality,'\",
		\"mr_artist_id\":\"',ga.mixradio_artist_id,'\",
		\"mr_artist_name\":\"',ga.mixradio_artist_name,'\",						
		\"mr_track_name\":\"',gt.mixradio_track_name,'\"}')),']') as releaseSeed
FROM grail.grail_track as gt, grail.grail_artist as ga, grail.grail_release as gr
WHERE gt.grail_artist_id = ga.grail_artist_id AND gt.grail_release_id = gr.grail_release_id 
GROUP BY gr.mixradio_release_id ORDER BY gt.updatedat_release DESC;

-- CHECK RELEASE: 
	-- SELECT count(*) FROM grail_release WHERE spotify_release_id IS NOT NULL AND spotify_release_id != "SPOTIFY_RELEASE_ID";
	-- UPDATE RELEASE (if CHECK = 0): 
		-- UPDATE grail.grail_release SET grail.grail_release.spotify_release_id = "MATCHED_SPOTIFY_RELEASE_ID", grail.grail_release.spotify_release_criteria = "SPOTIFY_CRITERIA_JSON" 
			-- WHERE grail.grail_release.mixradio_release_id = MIXRADIO_RELEASE_ID	
	-- INSERT RELEASE (if CHECK > 0):
		-- INSERT INTO grail_release(spotify_release_id,spotify_release_criteria,createdat_release,musicbrainz_release_id,musicbrainz_release_criteria,mixradio_release_id,mixradio_release_name,mixradio_track_cardinality,lastfm_release_id,lastfm_release_cardinality,)
	 		-- SELECT DISTINCT "MATCHED MUSICBRAINZ RELEASE ID","MUSICBRAINZ CRITERIA JSON","NEW TIMESTAMP",musicbrainz_release_id,musicbrainz_release_criteria,mixradio_release_id,mixradio_release_name,mixradio_track_cardinality,lastfm_release_id,lastfm_release_cardinality
	 		-- FROM grail.grail_release;