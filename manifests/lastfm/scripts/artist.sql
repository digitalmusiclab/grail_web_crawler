-- CHECKS LASFTM ARTIST DATA
	-- Gets lastfm Artist IDs with musicbrainz ID OR mixradio artist name. 
	-- API Parameters: artist name or musicbrainz artist IDs (when available)
	-- API REQUEST: http://ws.audioscrobbler.com/2.0/?method=artist.getinfo&api_key=API_KEY&artist=Cher&format=json
		-- 		OR: http://ws.audioscrobbler.com/2.0/?method=artist.getinfo&api_key=API_KEY&artist=ARTIST_MBID&format=json
	-- Manifest Columns = grail_release_ID | mixradio_release_ID | Arist JSON
		-- JSON track format = [ {"mr_artist_name": "Chingy", "cardinality": "69", "mb_track_id": "123asc}, ... ]

SET SESSION group_concat_max_len = 1000000;

SELECT ga.mixradio_artist_id as mr_artist_id,
	CONCAT('[',GROUP_CONCAT(DISTINCT CONCAT('{
		\"mr_artist_name\":\"',ga.mixradio_artist_name,'\",
		\"cardinality\":\"',ga.mixradio_artist_cardinality,'\",
		\"lastfm_artist_id\":\"',IF(ga.lastfm_artist_id IS NULL, "NULL",gr.musicbrainz_artist_id),'\",
		\"mb_artist_id\":\"',IF(ga.musicbrainz_artist_id IS NULL, "NULL",gr.musicbrainz_artist_id),'\"}')),']')  as artistSeed
FROM grail.grail_track as gt, grail.grail_artist as ga, grail.grail_release as gr 
WHERE gt.grail_track_id = ga.grail_artist_id AND gr.grail_release_id = gt.grail_release_id 
GROUP BY ga.mixradio_artist_id ORDER BY ga.updatedat_artist DESC;


-- CHECK ARTIST: 
	-- SELECT count(*) FROM grail_artist 
		-- WHERE lastfm_artist_id != "LASTFM ARTIST ID" AND lastfm_artist_id IS NOT NULL AND musicbrainz_artist_id != "MUSICBRAINZ_artist_ID" AND musicbrainz_artist_id IS NOT NULL AND mixradio_artist_id = MIXRADIO_ARTIST_ID;
	
	-- UPDATE RELEASE (if CHECK == 0):
		-- UPDATE grail.grail_artist SET lastfm_artist_id = "MATCHED_LASTFM_TRACK_ID", lastfm_artist_criteria = "MUSICBRAINZ_CRITERIA_JSON", musicbrainz_artist_id = "MUSICBRAINZ ARTIST ID FROM CRAWL" WHERE grail.grail_artist.mixradio_artist_id = MIXRADIO_ARTIST_ID	
	-- INSERT RELEASE (if CHECK > 0):
		-- INSERT INTO grail_artist(musicbrainz_artist_id,lastfm_artist_id,lastfm_artist_criteria,createdat_artist,spotify_artist_id,spotify_artist_name,spotify_artist_criteria,facebook_artist_id,digital7_US_artist_id,digital7_UK_artist_id,digital7_AU_artist_id,openaura_artist_id,musixmatch_WW_artist_id,jambase_artist_id,fma_artist_id,seatgeek_artist_id,seatwave_artist_id,lyricfind_US_artist_id,rdio_artist_id,echonest_artist_id,twitter_artist_id,tumblr_artist_id,mixradio_artist_id,mixradio_artist_name,mixradio_artist_cardinality)
	 		-- SELECT DISTINCT "NEW MUSICBRAINZ ARTIST ID","LASTFM ARTIST ID FROM CRAWL","LASTFM JSON_CRITERIA","NEW CREATE TIMESTAMP",spotify_artist_id,spotify_artist_name,spotify_artist_criteria,facebook_artist_id,digital7_US_artist_id,digital7_UK_artist_id,digital7_AU_artist_id,openaura_artist_id,musixmatch_WW_artist_id,jambase_artist_id,fma_artist_id,seatgeek_artist_id,seatwave_artist_id,lyricfind_US_artist_id,rdio_artist_id,echonest_artist_id,twitter_artist_id,tumblr_artist_id,mixradio_artist_id,mixradio_artist_name,mixradio_artist_cardinality
	 		-- FROM grail.grail_artist 
	 		-- WHERE mixradio_artist_id = MIXRADIO ARTIST;
