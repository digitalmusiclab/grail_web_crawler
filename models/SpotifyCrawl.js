module.exports = function(sequelize, DataTypes) {

	var SpotifyCrawl = sequelize.define("SpotifyCrawl", {
		isrc: {
			primaryKey: true,
			type: DataTypes.STRING
		},
		track_id: {
			primaryKey: true,
			type: DataTypes.STRING
		},
		album_id: {
			primaryKey: true,
			type: DataTypes.STRING
		},
		artist_id: {
			primaryKey: true,
			type: DataTypes.STRING
		},
		track_name: {
			allowNull: true,
			type: DataTypes.STRING
		},
		album_name: {
			allowNull: true,
			type: DataTypes.STRING
		},
		artist_name: {
			allowNull: true,
			type: DataTypes.STRING
		}
	},{
		tableName: "SpotifyCrawl",
	});
	
	return SpotifyCrawl;
};