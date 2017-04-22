'use strict';

// Load dependencies
const RateLimiter = require('rolling-rate-limiter');
const Redis = require('redis');
const secrets = require('./../config/secrets');

const redisConfiguration = secrets[process.env.NODE_ENV || 'development'].database.redis;
const client = Redis.createClient(redisConfiguration);

// Create a rate limiter for the Spotify API
const spotifyRateLimiter = RateLimiter({
  interval: 6000000,
  maxInInterval: 8,
  minDifference: 800,
  namespace: 'spotify_rate_limit',
  redis: client
});

// Create a rate limiter for the Echonest API
const echonestRateLimiter = RateLimiter({
  interval: 6000000,
  maxInInterval: 8,
  minDifference: 800,
  namespace: 'echonest_rate_limit',
  redis: client
});

exports = module.exports = {
  Echonest: echonestRateLimiter,
  Spotify: spotifyRateLimiter
};
