#!/bin/bash

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND="$SCRIPT_DIR/backend"
FRONTEND="$SCRIPT_DIR/frontend"

echo "▸ Backend: installing dependencies..."
cd "$BACKEND"
npm install
composer install

echo "▸ Backend: running migrations & seeding..."
php artisan migrate
php artisan db:seed --class=UserSeeder

echo "▸ Frontend: installing dependencies..."
cd "$FRONTEND"
npm install

echo "▸ Starting servers..."
cd "$BACKEND" && php artisan serve &

cd "$FRONTEND" && npm run dev
