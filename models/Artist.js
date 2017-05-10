module.exports = function(sequelize, DataTypes) {

    const Artist = sequelize.define('Artist', {
        grail_artist_id: {
            primaryKey: true,
            type: Sequelize.INTEGER(11),
            autoIncrement: true,
            allowNull: false,
            defaultValue: 0
        },
        spotify_artist_id: {
            type: Sequelize.STRING(22),
            allowNull: true,
            defaultValue: null
        },
        spotify_artist_name: {
            type: Sequelize.STRING(255),
            allowNull: true,
            defaultValue: null
        },
        spotify_artist_criteria: {
            type: Sequelize.BLOB,
            allowNull: true,
            defaultValue: null
        },
        facebook_artist_id: {
            type: Sequelize.BIGINT(20).UNSIGNED,
            allowNull: true,
            defaultValue: null
        },
        digital7_US_artist_id: {
            type: Sequelize.INTEGER(11),
            allowNull: true,
            defaultValue: null
        },
        digital7_UK_artist_id: {
            type: Sequelize.INTEGER(11),
            allowNull: true,
            defaultValue: null
        },
        digital7_AU_artist_id: {
            type: Sequelize.INTEGER(11),
            allowNull: true,
            defaultValue: null
        },
        openaura_artist_id: {
            type: Sequelize.STRING(24),
            allowNull: true,
            defaultValue: null
        },
        musixmatch_WW_artist_id: {
            type: Sequelize.INTEGER(11),
            allowNull: true,
            defaultValue: null
        },
        jambase_artist_id: {
            type: Sequelize.INTEGER(11),
            allowNull: true,
            defaultValue: null
        },
        fma_artist_id: {
            type: Sequelize.INTEGER(11),
            allowNull: true,
            defaultValue: null
        },
        seatgeek_artist_id: {
            type: Sequelize.INTEGER(11),
            allowNull: true,
            defaultValue: null
        },
        seatwave_artist_id: {
            type: Sequelize.INTEGER(11),
            allowNull: true,
            defaultValue: null
        },
        lyricfind_US_artist_id: {
            type: Sequelize.STRING(32),
            allowNull: true,
            defaultValue: null
        },
        rdio_artist_id: {
            type: Sequelize.STRING(255),
            allowNull: true,
            defaultValue: null
        },
        echonest_artist_id: {
            type: Sequelize.STRING(18),
            allowNull: true,
            defaultValue: null
        },
        twitter_artist_id: {
            type: Sequelize.STRING(15),
            allowNull: true,
            defaultValue: null
        },
        tumblr_artist_id: {
            type: Sequelize.STRING(255),
            allowNull: true,
            defaultValue: null
        },
        musicbrainz_artist_id: {
            type: Sequelize.STRING(32),
            allowNull: true,
            defaultValue: null
        },
        musicbrainz_artist_criteria: {
            type: Sequelize.BLOB,
            allowNull: true,
            defaultValue: null
        },
        mixradio_artist_id: {
            type: Sequelize.INTEGER(11),
            allowNull: true,
            defaultValue: null
        },
        mixradio_artist_name: {
            type: Sequelize.STRING(255),
            allowNull: true,
            defaultValue: null
        },
        mixradio_artist_cardinality: {
            type: Sequelize.INTEGER(11),
            allowNull: true,
            defaultValue: null
        },
        lastfm_artist_id: {
            type: Sequelize.INTEGER(11),
            allowNull: true,
            defaultValue: null
        },
        lastfm_artist_criteria: {
            type: Sequelize.BLOB,
            allowNull: true,
            defaultValue: null
        },
        createdat_artist: {
            type: Sequelize.DATE,
            allowNull: true,
            defaultValue: null,

        },
        updatedat_artist: {
            type: Sequelize.DATE, 
            allowNull: true,
            defaultValue: Sequelize.NOW
        }
    },

  });

    return Device;
};