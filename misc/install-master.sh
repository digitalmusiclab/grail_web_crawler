# Install Language Pack
sudo apt-get install language-pack-en

# Install Git
sudo apt-get install git

# Install ZSH
sudo apt-get install zsh

# Install Oh-My-Zsh
sudo sh -c "$(curl -fsSL https://raw.githubusercontent.com/robbyrussell/oh-my-zsh/master/tools/install.sh)"

#Install HTOP
sudo apt-get install htop 



# Install Redis
sudo add-apt-repository ppa:chris-lea/redis-server
sudo apt-get update
sudo apt-get install redis-server

# Install Postgres
sudo apt-get install postgresql postgresql-contrib

sudo -i -u 
createdb crawler
# create user crawl_worker with password 'password';
# GRANT ALL ON DATABASE crawler to crawl_worker;


# Install NVM
curl https://raw.githubusercontent.com/creationix/nvm/v0.31.0/install.sh | bash
source .bashrc

# Install Node
nvm install 4.2.6
nvm alias default 4.2.6
nvm use 4.2.6

#Install PM2
npm install pm2 -g

# Clone project repo
git clone git://github.com/digitalmusiclab/grail_web_crawler.git
npm install grail_web_crawler/


