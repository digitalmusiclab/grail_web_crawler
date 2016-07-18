module.exports = function(sequelize, DataTypes) {

	var EchonestCrawl = sequelize.define("EchonestCrawl", {
		spotify_track_id: {
			primaryKey: true,
			type: DataTypes.STRING
		},
		songs: {
			allowNull: true,
			type: DataTypes.JSON
		}
	},{
		tableName: "EchonestCrawl",
	});
	
	return EchonestCrawl;
};