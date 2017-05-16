'use strict';

// Load dependencies
const _ = require('lodash');


exports = module.exports = class MixRadioArtist {

    constructor(data) {
        this.id = data.mr_artist_id;
        this.name = data.mr_artist_name;
        this.cardinality = data.mr_artist_cardinality;
    }

};
