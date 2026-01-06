#!/usr/bin/env bash

# Database path
DB_PATH="./db.sqlite"

if [ "$#" -lt 2 ]; then
    echo "Usage: $0 <name> <url> [category]"
    echo "Example: $0 'My Game' 'https://example.com' 'puzzle'"
    exit 1
fi

NAME=$1
URL=$2
CATEGORY=${3:-""}

# Escape single quotes for SQL
ESCAPED_NAME="${NAME//\'/\'\'}"
ESCAPED_URL="${URL//\'/\'\'}"
ESCAPED_CATEGORY="${CATEGORY//\'/\'\'}"

echo "Adding/Updating game: $NAME ($URL)..."

sqlite3 "$DB_PATH" <<EOF
INSERT INTO game (name, url, category, isActive, createdAt)
VALUES ('$ESCAPED_NAME', '$ESCAPED_URL', '$ESCAPED_CATEGORY', 1, unixepoch())
ON CONFLICT(url) DO UPDATE SET
    name = excluded.name,
    category = excluded.category,
    isActive = 1,
    updatedAt = unixepoch();
EOF

if [ $? -eq 0 ]; then
    echo "Done!"
else
    echo "Error: Failed to update database."
    exit 1
fi
