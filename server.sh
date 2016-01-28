#!/bin/bash

clear
echo "[+] Removing old DB"
rm flask.db
rm log.log
echo "[+] Initializing DB"
python start.py
echo "[+] Starting server"
python FlaskServer.py
