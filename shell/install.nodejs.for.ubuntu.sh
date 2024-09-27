#!/bin/bash

node -v
if [ $? -eq 0 ] ; then
    echo 'nodejs installed already!!!'
    exit 0
fi

function chkExexResult {
    if [ $1 -ne 0 ] ; then
        echo 'exit by fail ('$2' -> exitCode:'$1')'
        exit 1
    fi
}

# install nodejs v20.x
curl -s https://deb.nodesource.com/setup_20.x | sudo bash
chkExexResult $? 'prapare node'

sleep 3

echo '---------------'
echo 'install nodejs'
sudo apt install nodejs -y

sleep 3

node -v
chkExexResult $? 'chk node'

echo '---------------'
echo 'npm install'
npm install

echo 'done.'
