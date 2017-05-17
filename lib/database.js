'use strcit';

const config = rootRequire('config');

module.exports = require("knex")(config.MySQL);