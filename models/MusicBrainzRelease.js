module.exports = function(sequelize, DataTypes) {

	var MusicBrainzRelease = sequelize.define("MusicBrainzRelease", {
		musicbrainz_release_id: {
			primaryKey: true,
			type: DataTypes.STRING
		},
		spotify_album_id: {
			allowNull: false,
			type: DataTypes.STRING
		},
		metadata: {
			allowNull: false,
			type: DataTypes.JSON
		}
	},{
		tableName: "MusicBrainzRelease",
	});
	
	return MusicBrainzRelease;
};