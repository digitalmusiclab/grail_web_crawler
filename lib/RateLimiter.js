var RateLimiter = require("rolling-rate-limiter");
var Redis = require("redis");
var client = Redis.createClient();

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