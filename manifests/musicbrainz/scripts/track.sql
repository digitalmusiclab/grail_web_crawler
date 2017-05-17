-- CHECKS MUSICBRAINZ RELEASE DATA
	-- Gets LAST.FM TRACK IDs with mixradio artist name/track name OR musicbrainz artist/track ID. 
	-- API Parameters: artist/release names and musicbrainz artist/release IDs (when available)
	-- API REQUEST: http://musicbrainz.org/ws/2/recording?query=%22we%20will%20rock%20you%22%20AND%20artist:queen
		-- 		OR: http://musicbrainz.org/ws/2/recording/MUSICBRAINZ_track_ID?fmt=json
	-- Manifest Columns = mixradio_track_ID | Track JSON
		-- JSON track format = [ {"mr_track_id": "12342", "position": "5", "mr_track_name": "Sabotage","mr_release_name":"Ill Communication","mr_artist_name":"Beastie Boys","musicbrainz_track_id": "NULL",}, ... ]

SET SESSION group_concat_max_len = 1000000;

SELECT DISTINCT gt.mixradio_track_id,
	CONCAT('[',GROUP_CONCAT(DISTINCT CONCAT('{
		\"position\":\"',gt.mixradio_track_position,'\",
		\"mr_track_name\":\"',gt.mixradio_track_name,'\",
		\"mr_artist_name\":\"',ga.mixradio_artist_name,'\",
		\"mr_release_name\":\"',gr.mixradio_release_name,'\",
		\"mb_track_id\":\"',IF(gr.musicbrainz_track_id IS NULL, "NULL",gr.musicbrainz_track_id),'\",
		\"mb_release_id\":\"',IF(gr.musicbrainz_release_id IS NULL, "NULL",gr.musicbrainz_release_id),'\"
		}')),']') as trackSeed
FROM 
	grail.grail_track as gt, 
	grail.grail_release as gr, 
	grail.grail_artist as ga
WHERE 
	gt.grail_artist_id = ga.grail_artist_id 
	AND gr.grail_release_id = gt.grail_release_id 
	AND LENGTH(gt.isrc) = 12 
GROUP BY 
	gt.mixradio_track_id 
ORDER BY gt.updatedat_track DESC;


-- CHECK TRACK: 
	-- SELECT count(*) FROM grail_track WHERE musicbrainz_track_id != "MUSICBRAINZ_track_ID" AND musicbrainz_track_id IS NOT NULL AND mixradio_track_id = MIXRADIO_TRACK_ID;
	
	-- UPDATE RELEASE (if CHECK == 0): 
		-- UPDATE grail.grail_track SET grail.grail_track.musicbrainz_track_id = "MATCHED_MUSICBRAINZ_TRACK_ID", grail.grail_track.musicbrainz_track_criteria2 = "MUSICBRAINZ_CRITERIA_JSON" 
			-- WHERE grail.grail_track.mixradio_track_id = MIXRADIO_TRACK_ID	
	
	-- INSERT RELEASE (if CHECK > 0):
		-- INSERT INTO grail_track(musicbrainz_track_id,musicbrainz_track_criteria2,updatedat_track,grail_artist_id,grail_release_id,isrc,spotify_track_id,spotify_track_name,spotify_track_criteria,echonest_track_id,lyricfind_US_track_id,musixmatch_track,mixradio_track_id,mixradio_track_name,mixradio_track_position,msd_track_id,lastfm_track_id,lastfm_track_criteria)
	 		-- SELECT DISTINCT "NEW MUSICBRAINZ TRACK ID","MUSICBRAINZ JSON_CRITERIA","NEW UPDATE TIMESTAMP",musicbrainz_track_id,musicbrainz_track_criteria2,updatedat_track,grail_artist_id,grail_release_id,isrc,spotify_track_id,spotify_track_name,spotify_track_criteria,echonest_track_id,lyricfind_US_track_id,musixmatch_track,mixradio_track_id,mixradio_track_name,mixradio_track_position,msd_track_id,lastfm_track_id,lastfm_track_criteria
	 		-- FROM grail.grail_track 
	 		-- WHERE mixradio_track_id = MIXRADIO TRACK ID;