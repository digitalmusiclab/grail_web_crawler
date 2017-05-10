'use strict';

// Load dependencies
const request = require('request');
const baseUrl = require('./base-url');


exports = module.exports = function getArtistById(id, callback) {

  const requestParams = {
    baseUrl,
    uri: `artists/${id}`
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
};
