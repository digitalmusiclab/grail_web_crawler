module.exports = {
    

    /**
     * PM2 Application Configuration
     * http://pm2.keymetrics.io/docs/usage/application-declaration/
     */
    "apps" : [
        {
            "name"          : "grail-master",
            "script"        : "./master.js",
            "instances"     : 1,
            "exec_mode"     : "fork",
            "watch"         : false,
            "env"           : { "NODE_ENV": "development" },
            "env_production": { "NODE_ENV": "production"  }
        },
        {
            "name"          : "grail-worker",
            "script"        : "./worker.js",
            "instances"     : 0,
            "exec_mode"     : "cluster",
            "watch"         : false,
            "env"           : { "NODE_ENV": "development" },
            "env_production": { "NODE_ENV": "production"  }
        }
    ],
    /**
     * PM2 Deployment Configuration
     * http://http://pm2.keymetrics.io/docs/usage/deployment/
     */
    "deploy": {
        "production": {
            "user"          : "kurtbradd",
            "host"          : "130.113.103.46",
            "ref"           : "origin/master",
            "repo"          : "https://github.com/digitalmusiclab/grail_web_crawler",
            "path"          : "/home/kurtbradd/grail_web_crawler",
            "pre-setup"     : "./deploy/pre-setup.sh",
            "post-setup"    : "./deploy/post-setup.sh",
            "pre-deploy-local": "rsync -avz -e 'ssh -p 22' ./config/.env.production kurtbradd@130.113.103.46:~/grail_web_crawler/config/.env.production",
            "post-deploy"   : "npm install && pm2 startOrGracefulReload ecosystem.config.js --env production"
        }
    }
}
