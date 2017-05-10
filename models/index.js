'use strict';

const fs = require("fs");
const path = require("path");
const env = process.env.NODE_ENV || "development";
const config  = require(__dirname + '/../config/secrets.js')[env].database.pg;
const Sequelize = require("sequelize");

const sequelize = new Sequelize("grail", "root", "devpassword", { host: 'localhost', dialect: 'mysql'});
const db = {};


const filterModelFiles = (file) => {
    return (file.indexOf(".") !== 0) && (file !== "index.js");
}

const requireModelFile = (file) => {
    let model = require(path.join(__dirname, file))
    db[model.className] = model;
}

const associateModel = (model) => {
    if ("associate" in db[model]) {
        db[model].associate(db);
    }
}

// Load Models
fs.readdirSync(__dirname)
.filter(filterModelFiles)
.forEach(requireModelFile);

// Associate Models
Object.keys(db).forEach(associateModel);

// Syncronize Database
sequelize.sync({force:false}).then(function () {
  console.log('Models Loaded');
});


db.sequelize = sequelize;
db.Sequelize = Sequelize;

exports = module.exports = db;