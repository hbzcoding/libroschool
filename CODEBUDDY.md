# LibroSchool CodeBuddy Context

## What This Project Is

LibroSchool is a web-first platform for Italian high school students.

It starts as a school book marketplace and grows into a student learning resource platform.

Books are the acquisition channel.
Notes, classrooms, and flashcards are the retention features.

## MVP

The MVP must include:
- user registration and login
- school selection
- used book selling
- book requests
- book search and filters
- simple messaging
- classroom rooms
- note sharing
- flashcards
- report system
- basic admin tools

## Not In MVP

Do not build:
- payment
- shipping
- native app
- parent portal
- official school management features
- attendance
- grades
- official absence letters
- digital signature system
- AI features
- complex social networking

## Architecture

Frontend:
- Next.js
- TypeScript
- Tailwind CSS
- shadcn/ui

Backend:
- Laravel
- PostgreSQL
- Laravel Sanctum
- Laravel Reverb

Storage:
- Cloudflare R2

Deployment:
- frontend on Vercel
- backend and database on VPS
- images on Cloudflare R2

## How CodeBuddy Should Work

Before coding:
1. Read AGENTS.md.
2. Read this file.
3. Read relevant docs.
4. Make a short plan.
5. Implement only the requested task.
6. Do not modify unrelated files.
7. Do not add unrelated features.
8. Update docs when API or database changes.
9. Add tests when backend behavior changes.
10. Explain what changed and how to test.

## Important Rule

Do not freely invent product scope.

If something is not specified, ask or keep it simple.

## Backend vs Backoffice

In this project:

`backend/` means Laravel JSON API backend.

It does not mean admin UI.

Laravel must not render Blade pages for the user app or admin panel.

`frontend/` means Next.js web application.

The Next.js frontend must eventually contain:

* user-facing pages
* dashboard pages
* admin/backoffice pages under `/admin`

The backoffice is part of the product, but it must be built later after the main MVP modules are stable.