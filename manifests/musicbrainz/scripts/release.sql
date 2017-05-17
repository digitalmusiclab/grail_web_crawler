-- CHECKS MUSICBRAINZ RELEASE DATA
	-- Gets MUSICBRAINZ Release IDs with musicbrainz release/artist IDs or mixradio artist/release names. 
	-- API Parameters: artist/release names and musicbrainz release_ids (when available)
	-- API REQUEST: http://musicbrainz.org/ws/2/release?query=%22we%20will%20rock%20you%22%20AND%20artist:queen
		-- 		OR: http://musicbrainz.org/ws/2/release/MUSICBRAINZ_RELEASE_ID?fmt=json&inc=recordings
	-- Manifest Columns = mixradio_release_ID | RELEASE JSON
		-- JSON track format = [ {"mr_track_id": "12342", "position": "5", "mr_track_name": "Sabotage","mr_release_name":"Ill Communication","mr_release_cardinality":"22","mr_artist_name":"Beastie Boys","musicbrainz_track_id": "NULL",}, ... ]

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
		\"mb_release_id\":\"',IF(gr.musicbrainz_release_id IS NULL, "NULL",gr.musicbrainz_release_id),'\",
		\"mb_track_id\":\"',IF(gr.musicbrainz_track_id IS NULL, "NULL",gr.musicbrainz_track_id),'\",						
		\"mr_track_name\":\"',gt.mixradio_track_name,'\"}')),']') as releaseSeed
FROM 
	grail.grail_track as gt, 
	grail.grail_artist as ga, 
	grail.grail_release as gr
WHERE 
	gt.grail_artist_id = ga.grail_artist_id 
AND gt.grail_release_id = gr.grail_release_id 
GROUP BY 
	gr.mixradio_release_id 
ORDER BY gt.updatedat_release DESC;


-- CHECK RELEASE: 
	-- SELECT count(*) FROM grail_release WHERE musicbrainz_release_id IS NOT NULL AND musicbrainz_release_id != "MUSICBRAINZ_RELEASE_ID" AND mixradio_release_id = MIXRADIO_RELEASE_ID;
	-- UPDATE RELEASE (if CHECK = 0): 
		-- UPDATE grail.grail_release SET grail.grail_release.musicbrainz_release_id = "MATCHED_MUSICBRAINZ_RELEASE_ID", grail.grail_release.musicbrainz_release_criteria = "MUSICBRAINZ_CRITERIA_JSON" 
			-- WHERE grail.grail_release.mixradio_release_id = MIXRADIO_RELEASE_ID	
	-- INSERT RELEASE (if CHECK > 0):
		-- INSERT INTO grail_release(musicbrainz_release_id,musicbrainz_release_criteria,createdat_release,spotify_release_id,spotify_release_criteria,mixradio_release_id,mixradio_release_name,mixradio_track_cardinality)
	 		-- SELECT DISTINCT "MATCHED MUSICBRAINZ RELEASE ID","MUSICBRAINZ CRITERIA JSON","NEW TIMESTAMP",spotify_release_id,spotify_release_criteria,mixradio_release_id,mixradio_release_name,mixradio_track_cardinality
	 		-- FROM grail.grail_release;

-- CHECK ARTIST: 
	-- SELECT count(*) FROM grail_release as gr, grail_artist as ga, grail_track 
		-- WHERE ga.mixradio_artist_id = "MIXRADIO_ARTIST_ID" AND ga.musicbrainz_artist_id != "MATCHED MUSICBRAINZ ARTIST ID FROM RELEASE CRAWL" AND gt.grail_artist_id = ga.grail_artist_id AND gt.grail_release_id = gr.grail_release_id
	-- UPDATE ARTIST (IF CHECK ARTIST = 0): 
		-- UPDATE grail_artist SET musicbrainz_artist_id = "MATCHED_MUSICBRAINZ_ARTIST_ID FROM RELEASE CRITERIA" 
			-- WHERE mixradio_artist_id = "MIXRADIO_ARTIST_ID")
	-- INSERT ARTIST (if CHECK > 0):
		-- INSERT INTO grail_artist(musicbrainz_artist_id,createdat_artist,spotify_artist_id,spotify_artist_name,spotify_artist_criteria,facebook_artist_id,digital7_US_artist_id,digital7_UK_artist_id,digital7_AU_artist_id,openaura_artist_id,musixmatch_WW_artist_id,jambase_artist_id,fma_artist_id,seatgeek_artist_id,seatwave_artist_id,lyricfind_US_artist_id,rdio_artist_id,echonest_artist_id,twitter_artist_id,tumblr_artist_id,musicbrainz_artist_criteria,mixradio_artist_id,mixradio_artist_name,mixradio_artist_cardinality,lastfm_artist_id,lastfm_artist_criteria)
			-- SELECT DISTINCT "NEW MUSICBRAINZ ARTIST ID", "NEW TIMESTAMP",spotify_artist_id,spotify_artist_name,spotify_artist_criteria,facebook_artist_id,digital7_US_artist_id,digital7_UK_artist_id,digital7_AU_artist_id,openaura_artist_id,musixmatch_WW_artist_id,jambase_artist_id,fma_artist_id,seatgeek_artist_id,seatwave_artist_id,lyricfind_US_artist_id,rdio_artist_id,echonest_artist_id,twitter_artist_id,tumblr_artist_id,musicbrainz_artist_criteria,mixradio_artist_id,mixradio_artist_name,mixradio_artist_cardinality,lastfm_artist_id,lastfm_artist_criteria
			-- FROM grail_artist;

-- IF AN INSERT FOR ARTIST OR RELEASE HAPPENS, update grail artist and release ids in grail_track table:
-- INSERT INTO grail.grail_track(grail_release_id,musicbrainz_track_id,grail_artist_id,isrc,spotify_track_id,spotify_track_name,spotify_track_criteria,musicbrainz_track_id,musicbrainz_track_criteria2,echonest_track_id,lyricfind_US_track_id,musixmatch_track_id,mixradio_track_id,mixradio_track_name,mixradio_track_position,msd_track_id,lastfm_track_id,lastfm_track_criteria,createdat_track);
	-- SELECT DISTINCT "NEW GRAIL_RELEASE_ID", "NEW/OLD GRAIL ARTIST ID", musicbrainz_track_id,grail_artist_id,grail_release_id,isrc,spotify_track_id,spotify_track_name,spotify_track_criteria,musicbrainz_track_id,musicbrainz_track_criteria2,echonest_track_id,lyricfind_US_track_id,musixmatch_track_id,mixradio_track_id,mixradio_track_name,mixradio_track_position,msd_track_id,lastfm_track_id,lastfm_track_criteria,createdat_track
	-- FROM grail.grail_track WHERE mixradio_track_id IN (MIXRADIO TRACK IDS);