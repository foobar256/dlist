#!/usr/bin/env bash

# Database path
DB_PATH="./db.sqlite"

echo "Current Games in Database:"
echo "--------------------------"
sqlite3 "$DB_PATH" -header -column "SELECT id, name, category, isActive, url FROM game ORDER BY id DESC;"
