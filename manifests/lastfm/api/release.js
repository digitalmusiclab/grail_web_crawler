'use strict';

// Load dependencies
const request = require('request');
const baseUrl = require('./base-url');




module.exports = function getReleaseById(musicbrainzReleaseId, musicbrainzArtistId, callback) {

  const requestParams = { 
    baseUrl,
    qs: {
      api_key: "b9e05b386939dbca75c553f6bdceebc1",
      format: "json",
      method: 'album.getinfo',
      artist: musicbrainzArtistId,
      album: musicbrainzReleaseId
    }
  }

  request(requestParams, (error, response, body) => {
      
      if (error) {
        return callback(error);
      }

      let data = null;
      
      try {
        data = JSON.parse(body);
      } 
      catch (error) {
        return callback(error);
      }

      return callback(null, data);
    }
  );
}


module.exports = function getReleaseByName(releaseName, artistName, callback) {
  
  const requestParams = { 
    baseUrl,
    qs: {
      api_key: "b9e05b386939dbca75c553f6bdceebc1",
      format: "json",
      method: 'album.getinfo',
      artist: artistName,
      album: releaseName
    }
  }

  request(requestParams, (error, response, body) => {
      
      if (error) {
        return callback(error);
      }

      let data = null;
      
      try {
        data = JSON.parse(body);
      } 
      catch (error) {
        return callback(error);
      }

      return callback(null, data);
    }
  );
}