#!/bin/bash
set -e

PORT=${PORT:-10000}
sed -i "s/Listen [0-9]*/Listen ${PORT}/" /etc/apache2/ports.conf
sed -i "s/<VirtualHost \*\:[0-9]*>/<VirtualHost *:${PORT}>/" /etc/apache2/sites-available/000-default.conf

# Storage link and caching
php artisan config:clear || true
php artisan cache:clear || true
php artisan storage:link --force || true

# Create SQLite database file if it does not exist
touch database/database.sqlite
chown -R www-data:www-data database
chmod -R 775 database

# Run database migrations
echo "Running database migrations..."
php artisan migrate --force --seed || echo "Migration skipped or warning"


exec apache2-foreground
