#!/bin/bash
#d
clear
if [ -e "seanbin.db" ]
then
echo "[+] Removing old DB"
rm seanbin.db
fi
if [ -e "log.log" ]
then
rm log.log
fi
echo "[+] Initializing DB"
python initdb.py
echo "[+] Starting server"
python runserver.py
