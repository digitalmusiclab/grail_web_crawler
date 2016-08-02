module.exports = function(sequelize, DataTypes) {

	var MBReleaseSPAlbumCrawl = sequelize.define("MBReleaseSPAlbumCrawl", {
		spotify_album_id: {
			primaryKey: true,
			type: DataTypes.STRING
		},
		spotify_album_name: {
			allowNull: false,
			type: DataTypes.STRING
		},
		spotify_album_cardinality: {
			allowNull: false,
			type: DataTypes.STRING
		},
		spotify_artist_name: {
			allowNull: false,
			type: DataTypes.STRING
		},
		metadata: {
			allowNull: false,
			type: DataTypes.JSON
		}
	},{
		tableName: "MBReleaseSPAlbumCrawl",
	});
	
	return MBReleaseSPAlbumCrawl;
};