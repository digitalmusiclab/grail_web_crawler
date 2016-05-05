var fs 			= require("fs");
var path 		= require("path");
var Sequelize 	= require("sequelize");

var env 		= process.env.NODE_ENV || "development";
var db_config 	= require("../config/secrets.js")[env].database.postgres;
var db 			= {};

var sequelize = new Sequelize(db_config.database, db_config.username, db_config.password, db_config.opts);

fs.readdirSync(__dirname)
.filter(function(file) {
	return (file.indexOf(".") !== 0) && (file !== "index.js");
})
.forEach(function(file) {
	var model = sequelize["import"](path.join(__dirname, file));
	db[model.name] = model;
});

Object.keys(db).forEach(function(modelName) {
	if ("associate" in db[modelName]) {
		db[modelName].associate(db);
	}
});

// When force is true, will wipe database when reloading models
sequelize.sync({force: false}).then(function () {
  console.log('Models Loaded');
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;