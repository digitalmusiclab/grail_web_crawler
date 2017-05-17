-- CHECKS SPOTIFY TRACK DATA
	-- Gets SPOTIFY TRACK/RELEASE/ARTIST IDs with mixradio ISRCs OR spotify track ID. 
	-- API Parameters: ISRC, TRACK IDs (when available)
	-- API REQUEST: https://api.spotify.com/v1/tracks/isrc:ISRC
		-- 		OR: https://api.spotify.com/v1/tracks/SPOTIFY_TRACK_ID
	-- Manifest Columns = mixradio ISRC | Track JSON
		-- JSON track format = [ {"mr_track_id": "12342", "position": "5", "mr_track_name": "Sabotage","mr_release_name":"Ill Communication","mr_artist_name":"Beastie Boys","musicbrainz_track_id": "NULL",}, ... ]

SET SESSION group_concat_max_len = 1000000;
SELECT DISTINCT 
	gt.isrc,
	CONCAT('[',GROUP_CONCAT(DISTINCT CONCAT('{
		\"mixradio_track_name\":\"',gt.mixradio_track_name,'\",
		\"spotify_track_id\":\"',IF(gt.spotify_track_id IS NULL, "NULL",gt.spotify_track_id),'\",
		\"position\":\"',gt.mixradio_track_position,'\",
		\"mixradio_track_id\":\"',gt.mixradio_track_id,'\"}')),']') as trackSeed
FROM mixradio.Track as mrt, mixradio.Artist as mra, mixradio.Collection as mrr, grail.grail_track as gt
WHERE mrt.artist_id = mra.artist_id AND mrt.collection_id = mrr.collection_id AND gt.mixradio_track_id = mrt.track_id AND LENGTH(mrt.isrc) = 12 
GROUP BY gt.isrc,gt.spotify_track_id ORDER BY updatedat_track DESC;


-- CHECK ARTIST:
	-- SELECT count(DISTINCT spotify_artist_id) FROM grail.grail_track as gt, grail.grail_artist as ga WHERE gt.spotify_track_id != "SPOTIFY_track_ID" AND gt.spotify_track_id IS NOT NULL AND ga.spotify_artist_id != "MATCHED SPOTIFY ARTIST ID FROM TRACK CRAWL", and ga.spotify_artist_id IS NOT NULL AND mixradio_track_id = MIXRADIO_TRACK_ID AND ga.grail_artist_id = gt.grail_track_id;
	-- UPDATE ARTIST (if CHECK == 0):
		-- -- UPDATE grail.grail_artist SET grail.grail_artist.spotify_artist_id = "MATCHED_SPOTIFY_TRACK_ID",  WHERE grail.grail_artist.mixradio_artist_id = MIXRADIO_ARTIST_ID
	 		-- SELECT DISTINCT "NEW MUSICBRAINZ TRACK ID","MUSICBRAINZ JSON_CRITERIA","NEW UPDATE TIMESTAMP",gt.musicbrainz_track_id,gt,musicbrainz_track_criteria2,gtupdatedat_track,gt.grail_artist_id,gt.grail_release_id,gt.isrc,gt.spotify_track_id,gt.spotify_track_name,gt.spotify_track_criteria,gt.echonest_track_id,gt.lyricfind_US_track_id,gt.musixmatch_track,gt.mixradio_track_id,gt.mixradio_track_name,gt.mixradio_track_position,gt.msd_track_id,gt.lastfm_track_id,gt.lastfm_track_criteria
	 		-- FROM grail.grail_track as gt
	 		-- WHERE gt.mixradio_track_id = MIXRADIO TRACK ID;
	-- INSERT ARTIST (if CHECK > 0):
		-- INSERT INTO grail_artist(spotify_artist_id,createdat_artist,spotify_artist_id,spotify_artist_name,spotify_artist_criteria,facebook_artist_id,digital7_US_artist_id,digital7_UK_artist_id,digital7_AU_artist_id,openaura_artist_id,musixmatch_WW_artist_id,jambase_artist_id,fma_artist_id,seatgeek_artist_id,seatwave_artist_id,lyricfind_US_artist_id,rdio_artist_id,echonest_artist_id,twitter_artist_id,tumblr_artist_id,musicbrainz_artist_criteria,mixradio_artist_id,mixradio_artist_name,mixradio_artist_cardinality,lastfm_artist_id,lastfm_artist_criteria)
			-- SELECT DISTINCT "NEW SPOTIFY ARTIST ID", "NEW TIMESTAMP",spotify_artist_id,spotify_artist_name,spotify_artist_criteria,facebook_artist_id,digital7_US_artist_id,digital7_UK_artist_id,digital7_AU_artist_id,openaura_artist_id,musixmatch_WW_artist_id,jambase_artist_id,fma_artist_id,seatgeek_artist_id,seatwave_artist_id,lyricfind_US_artist_id,rdio_artist_id,echonest_artist_id,twitter_artist_id,tumblr_artist_id,musicbrainz_artist_criteria,mixradio_artist_id,mixradio_artist_name,mixradio_artist_cardinality,lastfm_artist_id,lastfm_artist_criteria
			-- FROM grail_artist
			-- WHERE mixradio_artist_id = MIXRADIO ARTIST;

-- CHECK RELEASE:
	-- SELECT count(*) FROM grail_release as gr, grail_track as gt WHERE gr.spotify_release_id IS NOT NULL AND gr.spotify_release_id != "SPOTIFY_RELEASE_ID" AND gt.spotify_track_id = "MATCHED SPOTIFY TRACK ID" AND gr.mixradio_release_id = MIXRADIO_RELEASE_ID;
	-- UPDATE RELEASE (if CHECK = 0): 
		-- UPDATE grail.grail_release SET grail.grail_release.spotify_release_id = "MATCHED_SPOTIFY RELEASE_ID" 
			-- WHERE grail.grail_release.mixradio_release_id = MIXRADIO_RELEASE_ID;
	-- INSERT RELEASE (if CHECK > 0):
		-- INSERT INTO grail_release("NEW SPOTIFY RELEASE ID",createdat_release,musicbrainz_release_id,spotify_release_criteria,spotify_release_criteria,mixradio_release_id,mixradio_release_name,mixradio_track_cardinality)
	 		-- SELECT DISTINCT "MATCHED SPOTIFY RELEASE ID","NEW TIMESTAMP",musicbrainz_release_id,spotify_release_criteria,spotify_release_criteria,mixradio_release_id,mixradio_release_name,mixradio_track_cardinality
	 		-- FROM grail.grail_release;

-- CHECK TRACK: 
	-- SELECT count(*) FROM grail.grail_track WHERE spotify_track_id != "SPOTIFY_track_ID" AND spotify_track_id IS NOT NULL AND mixradio_track_id = MIXRADIO_TRACK_ID;
	-- UPDATE TRACK (if CHECK = 0): 
		-- UPDATE grail.grail_track SET grail.grail_track.spotify_track_id = "MATCHED_SPOTIFY_TRACK_ID", grail.grail_track.spotify_track_criteria = "SPOTIFY_CRITERIA_JSON" 
			-- WHERE grail.grail_track.mixradio_track_id = MIXRADIO_TRACK_ID AND grail.grail_track.spotify_track_id = "SPOTIFY TRACK ID"
	-- INSERT TRACK (if CHECK > 0): 
		-- INSERT INTO grail_track(spotify_track_id,spotify_track_criteria,createdat_track,grail_track_id,grail_artist_id,grail_release_id,isrc,spotify_track_name,musicbrainz_track_id,musicbrainz_track_criteria,musicbrainz_track_criteria2,echonest_track_id,lyricfind_US_track_id,musixmatch_track_id,mixradio_track_id,mixradio_track_name,mixradio_track_position,msd_track_id,lastfm_track_id,lastfm_track_criteria)
	 		-- SELECT DISTINCT "MATCHED SPOTIFY TRACK ID","SPOTIFY CRITERIA JSON","NEW CREATED AT TIMESTAMP", grail_track_id,grail_artist_id,grail_release_id,isrc,spotify_track_name,musicbrainz_track_id,musicbrainz_track_criteria,musicbrainz_track_criteria2,echonest_track_id,lyricfind_US_track_id,musixmatch_track_id,mixradio_track_id,mixradio_track_name,mixradio_track_position,msd_track_id,lastfm_track_id,lastfm_track_criteria
	 		-- FROM grail.grail_track;


-- IF AN INSERT FOR ARTIST OR RELEASE HAPPENS, update grail artist and release ids in grail_track table:
-- INSERT INTO grail.grail_track(grail_track_id,grail_artist_id,grail_release_id,isrc,spotify_track_name,musicbrainz_track_id,musicbrainz_track_criteria,musicbrainz_track_criteria2,echonest_track_id,lyricfind_US_track_id,musixmatch_track_id,mixradio_track_id,mixradio_track_name,mixradio_track_position,msd_track_id,lastfm_track_id,lastfm_track_criteria);
	-- SELECT DISTINCT "NEW GRAIL_TRACK_ID", "NEW/OLD GRAIL ARTIST ID", grail_release_id,isrc,spotify_track_id,spotify_track_name,spotify_track_criteria,musicbrainz_track_id,musicbrainz_track_criteria2,echonest_track_id,lyricfind_US_track_id,musixmatch_track_id,mixradio_track_id,mixradio_track_name,mixradio_track_position,msd_track_id,lastfm_track_id,lastfm_track_criteria,createdat_track
	-- FROM grail.grail_track WHERE spotify_track_id IN (SPOTIFY TRACK IDS);

