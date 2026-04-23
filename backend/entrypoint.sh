#!/bin/sh
set -e

echo "Aguardando SQL Server e aplicando migrations..."
until npx prisma migrate deploy; do
  echo "Banco ainda não disponível, tentando novamente em 5s..."
  sleep 5
done

echo "Migrations aplicadas. Iniciando API..."
exec node dist/app.js
