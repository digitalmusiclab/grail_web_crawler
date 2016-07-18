module.exports = function(sequelize, DataTypes) {

	var SpotifyAlbumCrawl = sequelize.define("SpotifyAlbumCrawl", {
		spotify_album_id: {
			primaryKey: true,
			type: DataTypes.STRING
		},
		metadata: {
			allowNull: false,
			type: DataTypes.JSON
		}
	},{
		tableName: "SpotifyAlbumCrawl",
	});
	
	return SpotifyAlbumCrawl;
};