#!/bin/bash
#d
clear
if [ -e "flask.db" ]
then
echo "[+] Removing old DB"
rm flask.db
fi
if [ -e "log.log" ]
then
rm log.log
fi
echo "[+] Initializing DB"
python start.py
echo "[+] Starting server"
python runserver.py
