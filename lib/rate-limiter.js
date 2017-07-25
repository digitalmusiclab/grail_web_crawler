'use strict';

// Load dependencies
const RateLimiter = require('rolling-rate-limiter');
const config = rootRequire('config');
const Redis = require('redis');
const redisClient = Redis.createClient(config.Redis);

// Create a rate limiter for the Spotify API
const spotifyRateLimiter = RateLimiter({
  interval: 500,
  maxInInterval: 10,
  minDifference: 100,
  namespace: 'spotify_rate_limit',
  redis: redisClient
});

// Create a rate limiter for the Echonest API
const echonestRateLimiter = RateLimiter({
  interval: 6000000,
  maxInInterval: 8,
  minDifference: 800,
  namespace: 'echonest_rate_limit',
  redis: redisClient
});

// Create a rate limiter for the MusicBrainz API
const musicBrainzRateLimiter = RateLimiter({
  interval: 60 * 1000, // 60 seconds
  maxInInterval: 30,
  minDifference: 2000, // 1.5 seconds between any two requests
  namespace: 'musicBrainzRateLimit',
  redis: redisClient
});

// Create a rate limiter for the Last.fm API
const lastfmRateLimiter = RateLimiter({
  interval: 60000,
  maxInInterval: 60,
  minDifference: 1500,
  namespace: 'lastfmRateLimit',
  redis: redisClient
});

exports = module.exports = {
  Echonest: echonestRateLimiter,
  MusicBrainz: musicBrainzRateLimiter,
  Spotify: spotifyRateLimiter,
  LastFm: lastfmRateLimiter
};
