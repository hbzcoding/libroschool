# LibroSchool Architecture

## Overview

LibroSchool uses a simple and scalable architecture:

- Next.js frontend
- Laravel API backend
- PostgreSQL database
- Cloudflare R2 for image storage
- Laravel Reverb for realtime messaging later
- Vercel for frontend deployment
- VPS for backend and database
- Cloudflare for DNS/CDN

## Architecture Diagram

```text
User Browser
    |
    v
Next.js Frontend on Vercel
    |
    v
Laravel API on VPS
    |
    v
PostgreSQL on VPS

Images:
Laravel API -> Cloudflare R2

Realtime:
Next.js -> Laravel Reverb -> Laravel API
```

## Frontend

Technology:
- Next.js
- TypeScript
- Tailwind CSS
- shadcn/ui
- React Hook Form
- Zod

Responsibilities:
- render UI
- handle forms
- call Laravel API
- manage client-side state
- show validation errors
- show loading and empty states

Frontend must not:
- directly access database
- enforce permissions by itself
- contain business logic that belongs to backend

## Backend

Technology:
- Laravel 11 or Laravel 12
- PHP 8.3+
- Laravel Sanctum
- Laravel Reverb
- PostgreSQL
- Cloudflare R2

Responsibilities:
- authentication
- authorization
- business logic
- database access
- file uploads
- API responses
- validation
- messaging
- reports
- admin operations

Backend must enforce all permissions.

## Database

Database:
- PostgreSQL

Why PostgreSQL:
- reliable relational database
- good for marketplace data
- good for classroom and permission relationships
- easy future migration to AWS RDS

## Storage

Images are stored in Cloudflare R2.

Use S3-compatible Laravel filesystem driver.

Store in database:
- public URL
- storage path

Do not store image binary data in PostgreSQL.

## Realtime

MVP can start with normal API polling for messages.

Later realtime can use:
- Laravel Reverb
- Laravel Echo
- WebSocket

Realtime is mainly for:
- messages
- future notifications

Do not build complex realtime features in MVP.

## Deployment

Frontend:
- Vercel

Backend:
- VPS Ubuntu
- Nginx
- PHP-FPM
- PostgreSQL
- Supervisor for queue workers
- optional Redis

Images:
- Cloudflare R2

DNS/CDN:
- Cloudflare

## Future Mobile App

A future Flutter app should use the same Laravel API.

Do not design frontend logic in a way that blocks future API reuse.

## Migration Strategy

To keep future migration easy:

- keep business logic in Laravel
- use standard PostgreSQL
- keep API contracts documented
- avoid provider lock-in where possible
- store files in S3-compatible structure
- do not spread Supabase-like direct queries in frontend

## Important Principle

Laravel API is the single source of truth for data and permissions.

## Backend and Backoffice Separation

The `backend/` service is Laravel JSON API only.

Laravel responsibilities:

* authentication
* authorization
* business logic
* database access
* file uploads
* user APIs
* admin APIs

Laravel must not render:

* public pages
* user dashboard pages
* admin/backoffice UI pages

The `frontend/` service is the Next.js web application.

Next.js responsibilities:

* public UI
* authenticated user UI
* student dashboard
* book/request/note/classroom pages
* admin/backoffice UI

Admin/backoffice pages live under:

```text
frontend/src/app/admin
```

Admin APIs live under:

```text
/api/admin/*
```

This separation keeps the Laravel API reusable for a future Flutter app.