module.exports = {
	development: {
		database: {
			redis: {
				host: "127.0.0.1",
				port: 6379,
				db: 0,
				options: {}
			},
			postgres: {
				database: "crawler",
				host: "0.0.0.0",
				port: 5432,
				username: "crawl_worker",
				password: "mybadpassword",
				opts: {
					dialect: "postgres",
					logging: false
				},
				url: "postgres://kurtbradd:@localhost:5432/spotify"
			}
		},
		queue: {
			kue: {
				prefix: "crawler_kue",
				jobEvents: false,
				disableSearch: true,
				redis: {
					host: "127.0.0.1",
					port: 6379,
					db: 0,
					options: {}
				}
			}
		} 
	}
}