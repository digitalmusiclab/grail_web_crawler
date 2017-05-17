-- CHECKS LAST.FM RELEASE DATA
	-- Gets LAST.FM Release IDs with mixradio artist name and release name OR musicbrainz. 
	-- API Parameters: artist/release names and musicbrainz artist/release IDs (when available)
	-- API REQUEST: http://ws.audioscrobbler.com/2.0/?method=album.getinfo&api_key=API_KEY&artist=Cher&album=Believe&format=json
		-- 		OR: http://ws.audioscrobbler.com/2.0/?method=album.getinfo&api_key=API_KEY&artist=ARTIST_MBID&album=RELEASE_MBID&format=json
	-- Manifest Columns = grail_release_ID | mixradio_release_ID | Track JSON
		-- JSON track format = [ {"mr_track_id": "12342", "position": "5", "mr_track_name": "Sabotage","mr_release_name":"Ill Communication","mr_release_cardinality":"22","mr_artist_name":"Beastie Boys","musicbrainz_track_id": "NULL","lfm_release_id":"1234"}, ... ]

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
		\"lfm_musicbrainz_release_id\":\"',IF(gr.lastfm_release_id IS NULL, "NULL",gr.lastfm_release_id),'\",
		\"mb_track_id\":\"',IF(gt.musicbrainz_track_id IS NULL, "NULL",gt.musicbrainz_track_id),'\",
		\"mb_artist_id\":\"',IF(ga.musicbrainz_artist_id IS NULL, "NULL",ga.musicbrainz_artist_id),'\",						
		\"mr_track_name\":\"',gt.mixradio_track_name,'\"}')),']') as releaseSeed
FROM grail.grail_track as gt, grail.grail_artist as ga, grail.grail_release as gr
WHERE gt.grail_artist_id = ga.grail_artist_id AND gt.grail_release_id = gr.grail_release_id 
GROUP BY gr.mixradio_release_id ORDER BY gt.updatedat_track DESC;


-- CHECK RELEASE: 
	-- SELECT count(*) FROM grail_release WHERE lastfm_release_id IS NOT NULL AND lastfm_release_id != "LASTFM_RELEASE_ID" AND musicbrainz_release_id IS NOT NULL AND musicbrainz_release_id != "MUSICBRAINZ_RELEASE_ID" AND mixradio_release_id = MIXRADIO_RELEASE_ID;
	-- UPDATE RELEASE (if CHECK = 0): 
		-- UPDATE grail.grail_release SET grail.grail_release.musicbrainz_release_id = "MATCHED_MUSICBRAINZ_RELEASE_ID", grail.grail_release.lastfm_release_id = "MATCHED_LASTFM_RELEASE_ID", ,grail.grail_release.lastfm_release_criteria = "MUSICBRAINZ_CRITERIA_JSON" 
			-- WHERE grail.grail_release.mixradio_release_id = MIXRADIO_RELEASE_ID	
	-- INSERT RELEASE (if CHECK > 0):
		-- INSERT INTO grail_release(musicbrainz_release_id,lastfm_release_id,lastfm_release_criteria,createdat_release,spotify_release_id,spotify_release_criteria,spotify_release_criteria,mixradio_release_id,mixradio_release_name,mixradio_track_cardinality)
	 		-- SELECT DISTINCT "MATCHED MUSICBRAINZ RELEASE ID","lastFM RELEASE ID","lastFM CRITERIA JSON","NEW TIMESTAMP",spotify_release_id,spotify_release_criteria,spotify_release_criteria,mixradio_release_id,mixradio_release_name,mixradio_track_cardinality
	 		-- FROM grail.grail_release;

-- CHECK ARTIST: 
	-- SELECT count(*) FROM grail_release as gr, grail_artist as ga, grail_track 
		-- WHERE ga.mixradio_artist_id = "MIXRADIO_ARTIST_ID" AND ga.musicbrainz_artist_id != "MATCHED MUSICBRAINZ ARTIST ID FROM RELEASE CRAWL" AND ga.lastfm_artist_id != "MATCHED LAST FM ARTIST ID FROM RELEASE CRAWL" AND gt.grail_artist_id = ga.grail_artist_id AND gt.grail_release_id = gr.grail_release_id
	-- UPDATE ARTIST (IF CHECK ARTIST = 0): 
		-- UPDATE grail_artist SET musicbrainz_artist_id = "MATCHED_MUSICBRAINZ_ARTIST_ID FROM RELEASE CRITERIA", lastfm_artist_id = "MATCHED LASTFM ARTIST ID" WHERE mixradio_artist_id = "MIXRADIO_ARTIST_ID")
	-- INSERT ARTIST (if CHECK > 0):
			-- INSERT INTO grail_artist(lastfm_artist_id,musicbrainz_artist_id,spotify_artist_id,spotify_artist_name,spotify_artist_criteria,facebook_artist_id,digital7_US_artist_id,digital7_UK_artist_id,digital7_AU_artist_id,openaura_artist_id,musixmatch_WW_artist_id,jambase_artist_id,fma_artist_id,seatgeek_artist_id,seatwave_artist_id,lyricfind_US_artist_id,rdio_artist_id,echonest_artist_id,twitter_artist_id,tumblr_artist_id,musicbrainz_artist_criteria,mixradio_artist_id,mixradio_artist_name,mixradio_artist_cardinality,lastfm_artist_criteria)
				-- SELECT DISTINCT "MATCHED LASTFM ARTIST ID FROM RELEASE CRAWL",musicbrainz_artist_id, spotify_artist_id,spotify_artist_name,spotify_artist_criteria,facebook_artist_id,digital7_US_artist_id,digital7_UK_artist_id,digital7_AU_artist_id,openaura_artist_id,musixmatch_WW_artist_id,jambase_artist_id,fma_artist_id,seatgeek_artist_id,seatwave_artist_id,lyricfind_US_artist_id,rdio_artist_id,echonest_artist_id,twitter_artist_id,tumblr_artist_id,musicbrainz_artist_criteria,mixradio_artist_id,mixradio_artist_name,mixradio_artist_cardinality,lastfm_artist_id,lastfm_artist_criteria
				-- FROM grail_artist
				-- WHERE mixradio_artist_id = MIXRADIO ARTIST;

-- IF AN INSERT FOR ARTIST OR RELEASE HAPPENS:
-- INSERT INTO grail.grail_track(grail_release_id,musicbrainz_track_id,grail_artist_id,isrc,spotify_track_id,spotify_track_name,spotify_track_criteria,musicbrainz_track_id,musicbrainz_track_criteria2,echonest_track_id,lyricfind_US_track_id,musixmatch_track_id,mixradio_track_id,mixradio_track_name,mixradio_track_position,msd_track_id,lastfm_track_id,lastfm_track_criteria,createdat_track);
	-- SELECT DISTINCT "NEW GRAIL_RELEASE_ID", "NEW/OLD GRAIL ARTIST ID", musicbrainz_track_id,grail_artist_id,grail_release_id,isrc,spotify_track_id,spotify_track_name,spotify_track_criteria,musicbrainz_track_id,musicbrainz_track_criteria2,echonest_track_id,lyricfind_US_track_id,musixmatch_track_id,mixradio_track_id,mixradio_track_name,mixradio_track_position,msd_track_id,lastfm_track_id,lastfm_track_criteria,createdat_track
	-- FROM grail.grail_track WHERE mixradio_track_id IN (MIXRADIO TRACK IDS);