#!/bin/sh

set -e

echo "⏳ Attente de la base de données..."
sleep 3

echo "🔄 Exécution des migrations Prisma..."
npx prisma migrate deploy

echo "🌱 Exécution du seed..."
ts-node --esm prisma/seed.ts

echo "✅ Migrations et seed complétés!"
echo "🚀 Démarrage du serveur..."

npm run dev
