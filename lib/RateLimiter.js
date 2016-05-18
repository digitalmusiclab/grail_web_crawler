var RateLimiter = require("rolling-rate-limiter");
var Redis = require("redis");

var env 		 = process.env.NODE_ENV || "development";
var redis_config = require("../config/secrets.js")[env].database.redis;

var client = Redis.createClient(redis_config);

var spotify_limiter = RateLimiter({
	redis: client,
	namespace: "spotify_rate_limit",
	interval: 6000000,
	maxInInterval: 8,
	minDifference: 800,
});

var echonest_limiter = RateLimiter({
	redis: client,
	namespace: "echonest_rate_limit",
	interval: 6000000,
	maxInInterval: 8,
	minDifference: 800,
});

module.exports = {
	Spotify: spotify_limiter,
	Echonest: echonest_limiter
}