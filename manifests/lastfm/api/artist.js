'use strict';

// Load dependencies
const request = require('request');
const baseUrl = require('./base-url');
const Config = rootRequire('config');


const sendRequest = function (parameters, callback) {
  
  request(parameters, (error, response, body) => {
      
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


module.exports = function getArtistByName(artistName, callback) {

  const requestParams = { 
    baseUrl,
    qs: {
      api_key: Config.Keys.LastFm,
      format: "json",
      method: 'artist.getinfo',
      artist: artistName
    }
  }

  return sendRequest(requestParams, callback);
}




module.exports = function getArtistById(musicbrainzArtistId, callback) {

  const requestParams = {
    baseUrl,
    qs: {
      api_key: Config.Keys.LastFm,
      format: "json",
      method: 'artist.getinfo',
      artist: musicbrainzArtistId
    }
  }

  return sendRequest(requestParams, callback);
};
