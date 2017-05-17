'use strict';

// Load dependencies
const request = require('request');
const baseUrl = require('./base-url');
const headers = require('./headers');


const sendRequest = function (parameters, callback) {
  
  request(parameters, (error, response, body) => {

      //console.log(response.request.uri.href)

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

      if (data.error) {
        return callback(data.error);
      }
      
      return callback(null, data);
  });
}


exports.getByName = (artistName, callback) => {

  const requestParams = {
    baseUrl,
    headers,
    qs: {
      query: artistName,
      fmt: 'json'
    },
    uri: "artist"
  }

  return sendRequest(requestParams, callback);
}


exports.getById = (id, callback) => {
  
  const requestParams = {
    baseUrl,
    headers,
    qs: { 
      inc: 'recordings',
      fmt: 'json'
    },
    uri: `artist/${id}`
  }

  return sendRequest(requestParams, callback);
};





exports.getReleaseCardinalityById = (id, callback) => {

  // http://musicbrainz.org/ws/2/release?artist=0383dadf-2a4e-4d10-a46a-e9e041da8eb3&fmt=json
  
  const requestParams = {
    baseUrl,
    headers,
    qs: { 
      artist: id,
      fmt: 'json'
    },
    uri: `release`
  }

  return sendRequest(requestParams, (error, data) => {
    if (error) {
      return callback(error)
    }

    return callback(null, data["release-count"]);
  });
};





exports.getArtistNameById = (id, callback) => {

  // http://musicbrainz.org/ws/2/artist/0383dadf-2a4e-4d10-a46a-e9e041da8eb3?fmt=json
  
  const requestParams = {
    baseUrl,
    headers,
    qs: {
      fmt: 'json'
    },
    uri: `artist/${id}`
  }

  return sendRequest(requestParams, (error, data) => {
    if (error) {
      return callback(error);
    }

    return callback(null, data.name);
  });
};
