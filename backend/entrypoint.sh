#!/bin/bash
set -e

PORT=${PORT:-10000}
sed -i "s/Listen [0-9]*/Listen ${PORT}/" /etc/apache2/ports.conf
sed -i "s/<VirtualHost \*\:[0-9]*>/<VirtualHost *:${PORT}>/" /etc/apache2/sites-available/000-default.conf

# Storage link and caching
php artisan config:clear || true
php artisan cache:clear || true
php artisan storage:link --force || true

# Run database migrations if DB_HOST is defined
if [ -n "$DB_HOST" ]; then
    echo "Running database migrations..."
    php artisan migrate --force || echo "Migration skipped or warning"
fi

exec apache2-foreground
