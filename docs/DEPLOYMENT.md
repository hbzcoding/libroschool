# LibroSchool Deployment

## Deployment Overview

Frontend:
- Vercel

Backend:
- VPS Ubuntu

Database:
- PostgreSQL on VPS

Storage:
- Cloudflare R2

DNS/CDN:
- Cloudflare

## Suggested Domains

```text
app.example.com -> Vercel frontend
api.example.com -> VPS Laravel API
```

## VPS Stack

Use:
- Ubuntu
- Nginx
- PHP-FPM
- PostgreSQL
- Composer
- Supervisor
- optional Redis

## Backend Deployment

Laravel backend should run behind Nginx.

Required environment variables:
```text
APP_NAME
APP_ENV
APP_KEY
APP_DEBUG
APP_URL

DB_CONNECTION
DB_HOST
DB_PORT
DB_DATABASE
DB_USERNAME
DB_PASSWORD

SANCTUM_STATEFUL_DOMAINS
SESSION_DOMAIN
FRONTEND_URL

FILESYSTEM_DISK
AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY
AWS_DEFAULT_REGION
AWS_BUCKET
AWS_ENDPOINT
AWS_USE_PATH_STYLE_ENDPOINT
```

Cloudflare R2 uses S3-compatible configuration.

## Frontend Deployment

Next.js frontend should deploy to Vercel.

Required environment variables:
```text
NEXT_PUBLIC_API_URL
```

## CORS

Laravel must allow frontend domain.

Example:
```text
https://app.example.com
```

During local development:
```text
http://localhost:3000
```

## Local Development

Backend:
```text
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan serve
```

Frontend:
```text
cd frontend
npm install
npm run dev
```

## Queues

Use Supervisor for Laravel queue workers when needed.

## Realtime

Laravel Reverb can be added after basic messaging works.

Do not add realtime before simple messaging is stable.

## Backups

MVP must have database backups.

At minimum:
- daily PostgreSQL dump
- store outside the main server if possible

## Security

Do not commit:
- .env
- API keys
- R2 secrets
- database passwords
- CodeBuddy model keys

## Git Ignore

The project should ignore:
```text
.env
.env.*
.codebuddy/models.json
.codebuddy/settings.local.json
node_modules
vendor
```