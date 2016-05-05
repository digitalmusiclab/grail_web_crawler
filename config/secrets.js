module.exports = {
	development: {
		database: {
			redis: {
				host: "0.0.0.0",
				port: 6379
			},
			postgres: {
				database: "spotify",
				host: "0.0.0.0",
				port: 5432,
				username: "kurtbradd",
				password: "",
				opts: {
					dialect: "postgres",
					logging: false
				},
				url: "postgres://kurtbradd:@localhost:5432/spotify"
			}
		}
	}
}