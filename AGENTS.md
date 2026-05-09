# LibroSchool Agent Instructions

## Project

LibroSchool is a web-first platform for Italian high school students.

The product helps students:
- sell used school books directly to other students
- post book requests
- search books by school, grade, subject, track, and ISBN
- message buyers and sellers
- create and join classroom rooms
- share notes
- study with flashcards

## Tech Stack

Backend:
- Laravel 11 or Laravel 12
- PHP 8.3+
- PostgreSQL
- Laravel Sanctum
- Laravel Reverb
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
- Backend and PostgreSQL on VPS
- Images on Cloudflare R2
- DNS/CDN on Cloudflare

## Non-Negotiable Rules

Do not implement:
- payment
- shipping
- mobile app
- parent portal
- official school attendance system
- official grades system
- official absence letters
- official school signatures
- AI features
- complex social network features

## Development Principles

- Build the Web MVP first.
- Keep the MVP simple.
- Backend owns all business logic.
- Frontend only consumes API.
- Do not directly access the database from frontend.
- Do not rely on frontend-only permission checks.
- Every important permission must be enforced on backend.
- Do not over-engineer.
- Do not introduce microservices.
- Do not introduce Kubernetes.
- Do not add unnecessary dependencies.
- Do not change API contracts without updating docs/API.md.
- Do not change database schema without updating docs/DATABASE.md.

## Development Order

Build in this order:

1. Auth
2. Schools
3. Books
4. Book Requests
5. Conversations
6. Classrooms
7. Notes
8. Flashcards
9. Reports
10. Admin

## Backend Rules

Laravel backend must use:
- FormRequest for validation
- Policy for authorization
- Resource for API response formatting
- Service classes for business logic
- Eloquent relationships
- migrations for schema changes
- Feature tests for important behavior

Controllers must stay thin.

## Frontend Rules

Next.js frontend must use:
- TypeScript
- Tailwind CSS
- shadcn/ui
- API service layer
- reusable components
- mobile-first UI

Do not put API calls directly inside page components.

### DESIGN.md — UI Design System

All frontend/UI related tasks must read `DESIGN.md` (Linear-inspired design system) before implementing any page or component.

`DESIGN.md` defines:
- Color palette (dark canvas, surface ladder, lavender-blue accent)
- Typography scale (display, headline, body, caption)
- Spacing and layout tokens
- Component specifications (buttons, cards, inputs, navigation)
- Border radius, elevation, and responsive behavior

Agents and developers must follow `DESIGN.md` as the authoritative UI design source.

## Security Rules

Users must not be able to:
- edit another user's book
- close another user's request
- see private notes
- see classroom notes if they are not members
- read conversations they do not belong to
- upload unsafe files

## File Upload Rules

Images:
- max size: 5MB
- allowed formats: jpg, jpeg, png, webp
- stored in Cloudflare R2
- save both URL and path in database

## Classroom Rules

Classrooms are user-generated.

Use:
- structured creation
- unique constraint
- join code
- owner/moderator/member roles
- report system

Do not require admin approval for every classroom.

## Project Sub-Agents

Available agents for LibroSchool:

- `backend-agent` - Laravel backend, migrations, models, API
- `frontend-agent` - Next.js pages, components, services
- `api-agent` - API contract review, route consistency
- `test-agent` - tests, lint, build, migrations
- `reviewer-agent` - diff review, scope control, security
- `planner-agent` - implementation plans for complex tasks
- `docs-agent` - documentation updates

Agents must be called explicitly by name.

Example:

```text
用 backend-agent 执行 Task 1: Database Foundation。
```

## Backend and Backoffice Clarification

The `backend/` directory is Laravel JSON API only.

The Laravel backend must not include:
- Blade user pages
- Blade admin pages
- Laravel-based backoffice UI

The `frontend/` directory is the Next.js web application.

The Next.js frontend includes:
- public pages
- authenticated student pages
- future admin/backoffice pages

Admin/backoffice UI must live in:

```text
frontend/src/app/admin
```

Laravel only provides admin APIs under:

```text
/api/admin/*
```

Admin/backoffice is part of the project, but it must be implemented in a later phase, not during project initialization.