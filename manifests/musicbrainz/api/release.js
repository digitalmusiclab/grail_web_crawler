'use strict';

// Load dependencies
const request = require('request');
const baseUrl = require('./base-url');
const headers = require('./headers');
const MusicBrainzTrack = require('./../models').Track;
const MusicBrainzRelease = require('./../models').Release;
const _ = require("lodash");


const sendRequest = function (parameters, callback) {

  request(parameters, (error, response, body) => {

      if (error) {
        return callback(error);
      }

      let data = null;
      try {
        data = JSON.parse(body);
      } catch (error) {
        return callback(error);
      }

      if (data.error) {
        return callback(data.error);
      }

      return callback(null, data);
    }
  );
}


exports.getByName = (releaseName, artistName, callback) => {


  const requestParams = {
    baseUrl,
    headers,
    qs: { 
      query: `${releaseName} AND artist:${artistName}`,
      fmt: 'json'
    },
    uri: `release`
  }

  return sendRequest(requestParams, (error, data) => {

    if (error) {
      return callback(error);
    }

    if (!data.releases) {
      return callback(null, null);
    }

    const mb_releases = _.map(data.releases, (release) => {

      const id = release.id;
      const name = release.title;
      const cardinality = release["track-count"]; 

      return new MusicBrainzRelease({ id, name, cardinality });
    });

    return callback(null, mb_releases);
  });
}







exports.getById = (id, callback) => {

  const requestParams = {
    baseUrl,
    headers,
    qs: { 
      inc: 'recordings+artists',
      fmt: 'json'
    },
    uri: `release/${id}`
  }


  return sendRequest(requestParams, (error, data) => {

    if (error) {
      return callback(error);
    }

    const releaseId = data.id;

    const releaseName = data.title;

    const releaseTracks = _.reduce(data.media, (tracks, media) => {

      const mb_tracks = _.map(media.tracks, (track) => {
        
        const id = track.id;
        const name = track.title;
        const position = track.number;

        return new MusicBrainzTrack({ id, name, position });
      })

      return tracks.concat(mb_tracks);
    }, []);


    // Note: Only using a single artist credit
    const artistCredit = data["artist-credit"][0];
    const artistId = (artistCredit) ? artistCredit.artist.id : null;

    // Backaway if no name or tracks are found
    if (!releaseId || !releaseName || !releaseTracks.length || !artistId) {
      return callback(null, null);
    }

    const sortedTracks = _.sortBy(releaseTracks, "position");

    // Map to MusicBrainz Release Object
    const releaseAttributes = { 
      id: releaseId, 
      name: releaseName, 
      tracks: sortedTracks, 
      artist_id: artist_id
    };

    return callback(null, new MusicBrainzRelease(releaseAttributes));
  });
};
