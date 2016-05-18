sudo apt-get update

sudo apt-get upgrade

# Install Required Packages
sudo apt-get install language-pack-en git zsh htop make g++ libpq-dev postgresql postgresql-contrib

# Install Oh-My-Zsh
sudo sh -c "$(curl -fsSL https://raw.githubusercontent.com/robbyrussell/oh-my-zsh/master/tools/install.sh)"

# Install Redis
sudo add-apt-repository ppa:chris-lea/redis-server
sudo apt-get update
sudo apt-get install redis-server
# Edit Redis conf to allow remote connections /etc/redis/redis.conf

sudo -i -u 
createdb crawler
# create database crawler;
# create user crawl_worker with password 'mybadpassword';
# GRANT ALL ON DATABASE crawler to crawl_worker;
# Edit /var/lib/pgsql/data/pg_hba.conf to allow remote auth
# Edit /etc/postgresql/9.1/main/postgresql.conf to allow remote connections
# Reload postgresql service


# Install NVM
curl https://raw.githubusercontent.com/creationix/nvm/v0.31.0/install.sh | zsh
source .zshrc

# Install Node
nvm install 4.2.6
nvm alias default 4.2.6
nvm use 4.2.6

#Install PM2
npm install pm2 -g

# Clone project repo
git clone git://github.com/digitalmusiclab/grail_web_crawler.git
npm install grail_web_crawler/


