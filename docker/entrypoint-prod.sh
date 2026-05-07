#!/bin/sh
set -e

echo "⏳ Waiting for database..."

# meilleure approche que sleep
until nc -z postgres 5432; do
  echo "Database not ready..."
  sleep 1
done

echo "🔄 Running migrations..."
npx prisma migrate deploy

echo "🌱 Running seed (optional)..."
node dist/prisma/seed.js || echo "No seed or already executed"

echo "🚀 Starting server..."
exec node dist/index.js