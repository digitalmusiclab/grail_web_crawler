# How to get started

## People to contact...
* [Matthew Woolhouse](woolhouse@mcmaster.ca) - Professor
* [Jotthi Bansal](bansalj@mcmaster.ca) - Lab instructor
* [Kurt](kurtbradd@gmail.com) - Developer
* [Michael](baronemda@gmail.com) - Developer
* [Michael Mallon](mallonm@mcmaster.ca) - IT Specialist

## Server info
* Server ip address: `130.113.103.46`
* Server host: `user_name@woolhouse-g.humanities.mcmaster.ca`

## How to use the Humanities Servers
1. Get access to the Humanities Server, ask [Dr. Woolhouse](woolhouse@mcmaster.ca) or [Jotthi](bansalj@mcmaster.ca).
2. Install VPN ([link](http://www.mcmaster.ca/uts/network/vpn/)) to access the server without being connected to McMaster's network.
3. ssh into the server. `ssh user_name@woolhouse-g.humanities.mcmaster.ca`.
---
# Redis Setup

---
# MySQL Setup
1. Download MySQL Community Edition (GPL) [link](https://dev.mysql.com/downloads/mysql/).
2. Change the temporary password:  
Open the MySQL terminal.
```bash
mysql -u root -h 127.0.0.1 -p
```
For macs, there is no default MySQL config. Add a file to `usr/local/mysql/etc/my.cnf`. This will skip the default password.
```
skip-grant-tables
```

Change the temporary password:
```sql
ALTER USER 'root'@'localhost' IDENTIFIED BY 'new-password';
```

---

# Workflow (locally)

clone the repo.
get the credentials.
install mysql, redis.

### 1. MySQL Tables
Rows cannot be added/deleted by the crawler if the tables in the database are not created.
1. run `rsync -avz -e 'ssh -p 22' user_name@130.113.103.46:~/grail-dump.sql.gz ~/local_directory`.
    * This will download a copy of the sql data in the database currently onto your
    local machine.
2. run `mysql -u username -p database_name < file.sql`.
    * In the directory that you downloaded the data into your local machine, this will
    populate your local database with the data and populate the database with the tables and columns.

### 2. Getting the Grails Crawler to crawl
To populate the job queue and start the crawler
1. run `npm run development:master`
    * This initializes the dashboard and job queue.
2. go to dashboard --> [link](http://localhost:3001/)
    * NTS: port listed in confs
3. run `npm run seed:musicbrainz:track`  
    * This loads the queue with jobs taken from the seed files (tsv).
4. run `npm run development:worker`  
    * This plucks the jobs from the job queue and processes the jobs.
    * This also inserts into the database.

### 3. Reseting the Job Queue.
To test previous crawls you will or to reset the job queue.
1. run `redis-cli`
    * The jobs are stored in a redis database so you will need to start the redis
    command prompt.
2. run `flushall`
    * This will clear the redis database and delete all the queued jobs.
