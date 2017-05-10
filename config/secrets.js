module.exports = {
  development: {
    keys: {
      lastfm: "b9e05b386939dbca75c553f6bdceebc1"
    },
    database: {
      redis: {
        host: '0.0.0.0',
        port: 6379,
        db: 0,
        options: {}
      },
      postgres: {
        database: 'crawler',
        port: 5432,
        username: 'crawl_worker',
        password: 'mybadpassword',
        opts: {
          host: '0.0.0.0',
          dialect: 'postgres',
          logging: false
        }
      }
    },
    queue: {
      kue: {
        prefix: 'crawler_kue',
        jobEvents: false,
        disableSearch: true,
        redis: {
          host: '0.0.0.0',
          port: 6379,
          db: 0,
          options: {}
        }
      }
    }
  }
};
