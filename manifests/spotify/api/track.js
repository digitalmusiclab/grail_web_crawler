'use strict';

// Load dependencies
const request = require('request');
const baseUrl = require('./base-url');




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


exports = module.exports = function getTrackByIsrc(isrc, callback) {

  const requestParams = {
    baseUrl,
    uri: `tracks/isrc:${isrc}`
  }

  return sendRequest(requestParams, callback);
};



exports = module.exports = function getTrackById(id, callback) {

  const requestParams = {
    baseUrl,
    uri: `tracks/${id}`
  }

  return sendRequest(requestParams, callback);
};
