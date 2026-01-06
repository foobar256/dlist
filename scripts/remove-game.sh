#!/usr/bin/env bash

# Database path
DB_PATH="./db.sqlite"

if [ "$#" -ne 1 ]; then
    echo "Usage: $0 <url_or_id>"
    echo "Example: $0 'https://example.com'  OR  $0 123"
    exit 1
fi

IDENTIFIER=$1

if [[ "$IDENTIFIER" =~ ^[0-9]+$ ]]; then
    echo "Removing game with ID: $IDENTIFIER..."
    sqlite3 "$DB_PATH" <<EOF
PRAGMA foreign_keys = ON;
DELETE FROM game_progress WHERE gameId = $IDENTIFIER;
DELETE FROM game WHERE id = $IDENTIFIER;
EOF
else
    echo "Removing game with URL: $IDENTIFIER..."
    ESCAPED_URL="${IDENTIFIER//\'/\'\'}"
    sqlite3 "$DB_PATH" <<EOF
PRAGMA foreign_keys = ON;
DELETE FROM game_progress WHERE gameId IN (SELECT id FROM game WHERE url = '$ESCAPED_URL');
DELETE FROM game WHERE url = '$ESCAPED_URL';
EOF
fi

if [ $? -eq 0 ]; then
    echo "Done!"
else
    echo "Error: Failed to remove game."
    exit 1
fi
