var kue 	= require("kue");
var Queue 	= kue.createQueue({jobEvents: false});

module.exports = Queue;