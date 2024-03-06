#!/bin/sh

set -e

[ -r './.env' ] && . ./.env

PORT="${PORT:-3000}"
HOST="${HOST:-localhost}"

exec npm run start -- -p "$PORT" -H "$HOST"

