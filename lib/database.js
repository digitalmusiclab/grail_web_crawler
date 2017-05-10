'use strcit';

const _ = require("lodash");

const config = {
    client: 'mysql',
    debug: true,
    connection: {
        host: 'localhost',
        user: 'root',
        port: 3306,
        password: 'devpassword',
        database: 'grail_api'
    },
    useNullAsDefault: true
}

const knex = require("knex")(config);






const updateGrailRelease = (mixradio_release_id, musicbrainz_release_id, musicbrainz_release_criteria) => {

    // Convert Critera Score to JSON String
    musicbrainz_release_criteria = JSON.stringify(musicbrainz_release_criteria);


    // Query to find releases that need updating
    const rowsToUpdateQuery = knex("grail_release")
        .where(function() {
          this.where('musicbrainz_release_id', musicbrainz_release_id).orWhereNull("musicbrainz_release_id")
        })
        .andWhere("mixradio_release_id", mixradio_release_id);



    // Find the number of releases that need updating
    rowsToUpdateQuery.count("*").then( (count) => {
        
        // Update the necessary rows with new criteria
        if (count > 0) {
            return rowsToUpdateQuery.update({ musicbrainz_release_id, musicbrainz_release_criteria });
        }

        // Distinct columns to merge with new attributes for insert into Grail Release
        const distinctColumns = [
            "spotify_release_id", "spotify_release_criteria",
            "mixradio_release_id", "mixradio_release_name", "mixradio_release_cardinality"
        ];

        return knex("grail_release")
        .distinct(distinctColumns)
        .where('mixradio_release_id', mixradio_release_id)
        .then( (rows) => {

            // Merge Distinct Attributes with new MusicBrainz Attributes
            const newReleases = _.map(rows, (release) => {
                return _.merge(release, { musicbrainz_release_id, musicbrainz_release_criteria });
            });

            const chunkSize = newReleases.length;
            return knex.batchInsert('grail_release', newReleases, chunkSize);
        });    

    });
}



const checkReleaseCount = (mixradio_release_id, musicbrainz_release_id) => {

    return knex("grail_release")
        .where(function() {
          this.where('musicbrainz_release_id', musicbrainz_release_id).orWhereNull("musicbrainz_release_id")
        })
        .andWhere("mixradio_release_id", mixradio_release_id)
        .count("*");
}


const updateRelease = (mixradio_release_id, musicbrainz_release_id, musicbrainz_release_criteria) => {

    musicbrainz_release_criteria = JSON.stringify(musicbrainz_release_criteria);

    return knex("grail_release")
        .where(function() {
          this.where('musicbrainz_release_id', musicbrainz_release_id).orWhereNull("musicbrainz_release_id")
        })
        .andWhere("mixradio_release_id", mixradio_release_id)
        .update({ musicbrainz_release_id, musicbrainz_release_criteria });
}


const insertRelease = (mixradio_release_id, musicbrainz_release_id, musicbrainz_release_criteria) => {

    musicbrainz_release_criteria = JSON.stringify(musicbrainz_release_criteria);

    // Distinct columns to merge with new attributes for insert into Grail Release
    const distinctColumns = [
        "spotify_release_id", "spotify_release_criteria",
        "mixradio_release_id", "mixradio_release_name", "mixradio_release_cardinality"
    ];

    return knex("grail_release")
    .distinct(distinctColumns)
    .where('mixradio_release_id', mixradio_release_id)
    .then( (distinctReleases) => {
        // Merge Distinct Attributes with new MusicBrainz Attributes
        return _.map(distinctReleases, (release) => {
            return _.merge(release, { musicbrainz_release_id, musicbrainz_release_criteria });
        });
    })
    .then( (newReleases) => {
        const chunkSize = newReleases.length;
        return knex.batchInsert('grail_release', newReleases, chunkSize);
    });
}



/*  
    If a new artist or release inserted, we must insert into Grail Track with the new grail ids for artist, and release
    for all tracks with the original mixradio_release_id used to crawl.

    @param { string } grail_release_ids - Grail Release IDs of inserted Releases
    @param { string } grail_artist_ids - Grail Artist IDs of inserted Artists
    @param { string } mr_track_ids - MixRadio Track ID related to new Release and Artist inserts
*/
const insertTrack = (grail_release_ids, grail_artist_ids, mr_track_ids) => {


    // Create Unique Release Artist Pairs
    let artistReleaseIdPairs = [];
    _.each(grail_release_ids, (grail_release_id) => {
        _.each(grail_artist_ids, (grail_artist_id) => {
            artistReleaseIdPairs.push({ grail_release_id, grail_artist_id});
        });
    });

    // Distinct Columns To Copy From Grail Track When Inserting A New Track
    const distinctTrackColumns = [
        "musicbrainz_track_id",
        "isrc",
        "spotify_track_id",
        "spotify_track_name",
        "spotify_track_criteria",
        "musicbrainz_track_id",
        "musicbrainz_track_criteria2",
        "echonest_track_id",
        "lyricfind_US_track_id",
        "musixmatch_track_id",
        "mixradio_track_id",
        "mixradio_track_name",
        "mixradio_track_position",
        "msd_track_id",
        "lastfm_track_id",
        "lastfm_track_criteria",
    ]

    return knex("grail_track")
        .distinct(distinctTrackColumns)
        .whereIn('mixradio_track_id', mr_track_ids)
        .then( (distinctTracks) => {

            let insertTracks = [];
            _.each(distinctTracks, (track) => {
                _.each(artistReleaseIdPairs, (idPair) => {
                    insertTracks.push(_.merge(track, idPair));
                });
            });

            return insertTracks;
        })
        .then( (newTracks) => {
            const chunkSize = newTracks.length;
            return knex.batchInsert('grail_track', newTracks, chunkSize);
        });
}