var env 		= process.env.NODE_ENV || "development";
var kue_config 	= require("../config/secrets.js")[env].queue.kue;

var kue 	= require("kue");
var Queue 	= kue.createQueue(kue_config);

module.exports = Queue;