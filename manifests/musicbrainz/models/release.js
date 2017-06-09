'use strict';

// Load Dependencies
const _ = require('lodash');
const MusicBrainzTrack = require('./track');

/**
 * Composes a Music Brainz album from the API.  Contains information about the album
 * itself and artists associated with it.
 */
exports = module.exports = class MusicBrainzRelease {
  
    constructor(data) {
        this.id = data.id;
        this.name = data.name;
        this.cardinality = data.cardinality || data.tracks.length;
        this.artist_id = data.artist_id;
        this.tracks = data.tracks;
    }
};

/*
    JSONResponseMapper

    @param { object } apiResponse - JSON Response from MusicBrainz API

    @return { array[`MusicBrainzRelease`] } Parsed MusicBrainzRelease Objects 
*/
module.exports.JSONResponseMapper = (data) => {

    if (!data.releases) {
        return [];
    }

    const mb_releases = _.map(data.releases, (release) => {
        return new MusicBrainzRelease({ 
            id: release.id,
            name:  release.title,
            cardinality: release["track-count"]
        });
    });

    return mb_releases;
}