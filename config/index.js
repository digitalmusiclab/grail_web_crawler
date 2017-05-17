'use strict';

/* Kue Job Queue Configuration */
exports.JobQueue = {
    prefix: process.env.JOB_QUEUE_PREFIX,
    jobEvents: (process.env.JOB_QUEUE_JOB_EVENTS == 'true'),
    disableSearch: (process.env.JOB_QUEUE_DISABLE_SEARCH == 'true'),
    redis: {
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT,
        db: process.env.REDIS_DB,
        options: {}
    }
}

/*  MySQL Database Configuration */
exports.MySQL = {
    client: 'mysql',
    debug: (process.env.MYSQL_DEBUG == 'true'),
    connection: {
        host: process.env.MYSQL_CONNECTION_HOST,
        port: process.env.MYSQL_CONNECTION_PORT,
        user: process.env.MYSQL_CONNECTION_USERNAME,
        password: process.env.MYSQL_CONNECTION_PASSWORD,
        database: process.env.MYSQL_CONNECTION_DATABASE
    },
    useNullAsDefault: true
}

exports.Redis = {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    db: process.env.REDIS_DB,
    options: {}
}

exports.Dashboard = {
    port: process.env.DASHBOARD_PORT
}

exports.Keys = {
    LastFm: process.env.KEY_LASTFM
}