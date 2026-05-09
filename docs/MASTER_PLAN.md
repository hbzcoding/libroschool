# LibroSchool Master Plan

## Project Name

LibroSchool

## Product Positioning

LibroSchool is a web-first platform for Italian high school students.

It helps students:
- sell used school books directly to other students
- post book requests
- search books by school, grade, subject, track, and ISBN
- message buyers and sellers
- create and join classroom rooms
- share notes
- study with flashcards

## Core Product Logic

LibroSchool is not only a used book marketplace.

The product structure is:

```text
Books and requests = acquisition
Classroom rooms = organization
Notes and flashcards = retention
Messages = transaction matching
Reports and admin = governance
```

## MVP Goal

The first MVP must validate this question:

```text
Will students use a school-based platform to buy and sell books directly?
```

## MVP 1 Scope

MVP 1 includes:

1. Auth
2. Schools
3. Books
4. Book Requests
5. Conversations
6. Basic user profile

MVP 1 does not include:

- payment
- shipping
- mobile app
- parent portal
- official school management features
- AI features
- complex social networking

## MVP 2 Scope

MVP 2 includes:

1. Classrooms
2. Classroom membership
3. Classroom books
4. Classroom requests
5. Classroom basic resources

## MVP 3 Scope

MVP 3 includes:

1. Notes
2. Note visibility
3. Flashcards
4. Classroom notes

## MVP 4 Scope

MVP 4 includes:

1. Reports
2. Admin dashboard
3. User moderation
4. Content moderation
5. School management

## Tech Stack

Backend:
- Laravel 12
- PHP 8.3+
- PostgreSQL
- Laravel Sanctum
- Laravel Reverb later
- Cloudflare R2

Frontend:
- Next.js
- TypeScript
- Tailwind CSS
- shadcn/ui
- React Hook Form
- Zod

Deployment:
- Frontend on Vercel
- Backend on VPS
- PostgreSQL on VPS
- Images on Cloudflare R2
- DNS/CDN on Cloudflare

## Backend Definition

The `backend/` directory is Laravel JSON API only.

Laravel must not render:
- public pages
- user dashboard pages
- admin/backoffice pages

Laravel provides:
- user APIs
- admin APIs
- auth
- authorization
- database access
- file uploads
- business logic

## Frontend Definition

The `frontend/` directory is the Next.js web application.

It includes:
- public pages
- user-facing pages
- authenticated dashboard
- future admin/backoffice pages

Admin pages live under:

```text
frontend/src/app/admin
```

## Main Development Principle

Every phase must be completed, tested, reviewed, and committed before moving to the next phase.

Do not allow an agent to build the entire project at once.
