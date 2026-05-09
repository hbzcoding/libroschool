# LibroSchool Agent Tasks

This file defines which agent should execute each phase.

## Core Rule For All Agents

The full project plan is context only.

Agents must execute only the assigned task.

Agents must stop after completing the assigned task.

Agents must not start the next task automatically.

Every task must follow this workflow:

1. The assigned implementation agent completes the task.
2. `test-agent` runs relevant tests or explains exactly how to run them.
3. `reviewer-agent` reviews the diff, scope, security, and risks.
4. Human reviews the output.
5. Human commits the changes.
6. Only then can the next task begin.

## Available Agents

Use only these agents:

- `api-agent`
- `backend-agent`
- `frontend-agent`
- `reviewer-agent`
- `test-agent`
- `code-explorer`

There is no separate `database-agent`.

Database Foundation must be executed by `backend-agent`, because migrations, models, relationships, factories, and seeders are Laravel backend work.

## Agent Responsibilities

### api-agent

Use for:
- API contract review
- route consistency
- request/response schema review
- pagination consistency
- frontend/backend API alignment

Do not use `api-agent` to:
- create migrations
- create Eloquent models
- create frontend pages
- implement UI

### backend-agent

Use for:
- Laravel backend
- PostgreSQL migrations
- Eloquent models
- relationships
- factories
- seeders
- API controllers
- FormRequest classes
- API Resources
- Policies
- Services
- backend Feature Tests
- Cloudflare R2 backend integration

### frontend-agent

Use for:
- Next.js pages
- React components
- frontend services
- TypeScript types
- forms
- UI
- routing
- frontend lint/build issues

### test-agent

Use for:
- running tests
- running migrations
- running lint
- running build
- checking type errors
- checking migration failures
- applying small task-related fixes only

Do not use `test-agent` to implement new product features.

### reviewer-agent

Use for:
- reviewing diffs
- checking scope control
- checking security risks
- checking permission issues
- checking if an agent added unrelated features
- checking if the implementation matches docs

### code-explorer

Use for:
- searching files
- understanding existing structure
- locating relevant code

Usually this agent is used automatically.

---

# Task 1: Database Foundation

## Implementation Agent

`backend-agent`

## Why

Database Foundation is assigned to `backend-agent` because Laravel migrations, models, relationships, factories, and seeders belong to the backend.

## Read Before Starting

- `AGENTS.md`
- `CODEBUDDY.md`
- `docs/DATABASE.md`
- `docs/DATABASE_PLAN.md`
- `docs/EXECUTION_PLAN.md`
- `docs/SECURITY.md`
- `.codebuddy/rules/02-backend-laravel.md`
- `.codebuddy/rules/04-database.md`

## Task

Create database foundation.

Implement:
- migrations
- Eloquent models
- relationships
- factories
- seeders

Required business tables:
- schools
- books
- book_images
- book_requests
- classrooms
- classroom_members
- notes
- note_permissions
- flashcards
- conversations
- conversation_members
- messages
- reports

Modify users table with:
- role
- school_id
- grade
- track

Keep Laravel/Sanctum/session/cache/queue system tables.

Do not delete system tables.

Do not manually clear the database.

## Do Not Implement

- API controllers
- API routes
- frontend pages
- admin/backoffice pages
- business logic outside database foundation

## Validation Agent

`test-agent`

Run:

```bash
cd backend
php artisan migrate:fresh --seed
php artisan test
```

## Review Agent

`reviewer-agent`

Check:
- migrations match `docs/DATABASE.md`
- no API code was added
- no frontend code was added
- foreign keys are reasonable
- unique constraints exist
- Laravel/Sanctum system tables were not deleted
- docs were updated only if necessary

## Stop Rule

After review, stop and wait for human commit.

---

# Task 2: Auth and Schools Backend

## Implementation Agent

`backend-agent`

## Read Before Starting

- `docs/BACKEND_PLAN.md`
- `docs/API.md`
- `docs/DATABASE.md`
- `docs/SECURITY.md`
- `.codebuddy/rules/02-backend-laravel.md`

## Task

Implement Auth and Schools APIs.

Auth endpoints:
```http
POST /api/register
POST /api/login
POST /api/logout
GET /api/me
PUT /api/me
```

Schools endpoints:
```http
GET /api/schools
GET /api/schools/{id}
POST /api/schools
```

Requirements:
- Laravel Sanctum
- FormRequest validation
- UserResource
- SchoolResource
- default role = student
- password hash must never be returned
- protected endpoints require auth
- schools list is paginated
- school creation is admin only

## Do Not Implement

- books API
- book requests API
- messages API
- classrooms API
- notes API
- frontend pages
- admin UI

## Validation Agent

`test-agent`

Run:

```bash
cd backend
php artisan test
```

## Review Agent

`reviewer-agent`

Check:
- auth endpoints are protected correctly
- non-admin cannot create schools
- password hash is not exposed
- school_id validation exists
- no frontend changes

## Stop Rule

After review, stop and wait for human commit.

---

# Task 3: Auth and Schools Frontend

## Implementation Agent

`frontend-agent`

## Read Before Starting

- `docs/FRONTEND_PLAN.md`
- `docs/UI.md`
- `docs/API.md`
- `.codebuddy/rules/03-frontend-nextjs.md`

## Task

Create:
- `/login`
- `/register`
- `/dashboard`
- `/profile`
- `frontend/src/services/auth.ts`
- `frontend/src/services/schools.ts`
- `frontend/src/types/user.ts`
- `frontend/src/types/school.ts`
- `SchoolSelector`

Requirements:
- TypeScript
- Tailwind CSS
- shadcn/ui
- React Hook Form
- Zod
- API calls in services
- `NEXT_PUBLIC_API_URL`
- login redirects to `/dashboard`
- register redirects to `/dashboard`
- profile updates name, school_id, grade, track

## Do Not Implement

- books pages
- requests pages
- notes pages
- classrooms pages
- messages pages
- admin pages

## Validation Agent

`test-agent`

Run:

```bash
cd frontend
npm run lint
npm run build
```

## Review Agent

`reviewer-agent`

Check:
- API calls are in services
- no backend code was modified unnecessarily
- forms validate inputs
- no admin pages were created

## Stop Rule

After review, stop and wait for human commit.

---

# Task 4: Books Backend

## Implementation Agent

`backend-agent`

## Task

Implement Books API.

Endpoints:
```http
GET /api/books
GET /api/books/{id}
POST /api/books
PUT /api/books/{id}
DELETE /api/books/{id}
POST /api/books/{id}/mark-reserved
POST /api/books/{id}/mark-sold
```

Requirements:
- BookPolicy
- BookResource
- StoreBookRequest
- UpdateBookRequest
- BookService
- pagination
- filters
- seller-only update/delete
- seller-only mark reserved/sold
- Feature tests

## Do Not Implement

- image upload
- frontend pages
- book requests API
- messages API
- classrooms API
- notes API

## Validation Agent

`test-agent`

Run:

```bash
cd backend
php artisan test
```

## Review Agent

`reviewer-agent`

Check:
- authorization
- pagination
- filters
- no frontend changes
- no unrelated modules

## Stop Rule

After review, stop and wait for human commit.

---

# Task 5: Book Image Upload Backend

## Implementation Agent

`backend-agent`

## Task

Implement Cloudflare R2 book image upload.

Endpoint:
```http
POST /api/books/{id}/images
```

Requirements:
- only seller can upload
- jpg/jpeg/png/webp only
- max 5MB
- use S3-compatible Laravel filesystem
- save url and path
- update `.env.example`
- update deployment docs if needed
- no secrets committed

## Do Not Implement

- frontend pages
- other business modules

## Validation Agent

`test-agent`

Run:

```bash
cd backend
php artisan test
```

## Review Agent

`reviewer-agent`

Check:
- no secrets committed
- upload validation
- seller-only permission
- R2 env vars documented

## Stop Rule

After review, stop and wait for human commit.

---

# Task 6: Books Frontend

## Implementation Agent

`frontend-agent`

## Task

Create:
- `/books`
- `/books/new`
- `/books/[id]`
- `frontend/src/services/books.ts`
- `frontend/src/types/book.ts`
- BookCard
- BookFilters
- CreateBookForm
- ImageUploader

Requirements:
- mobile-first
- card-based UI
- API calls in services
- forms with React Hook Form + Zod
- listing filters
- book detail
- create book
- image upload
- seller actions

## Do Not Implement

- requests pages
- messages pages
- classrooms pages
- notes pages
- admin pages

## Validation Agent

`test-agent`

Run:

```bash
cd frontend
npm run lint
npm run build
```

## Review Agent

`reviewer-agent`

Check:
- UI follows `docs/UI.md`
- no backend changes unless necessary
- API service layer used

## Stop Rule

After review, stop and wait for human commit.

---

# Task 7: Book Requests Backend

## Implementation Agent

`backend-agent`

## Task

Implement Book Requests API.

Endpoints:
```http
GET /api/book-requests
GET /api/book-requests/{id}
POST /api/book-requests
PUT /api/book-requests/{id}
DELETE /api/book-requests/{id}
POST /api/book-requests/{id}/close
```

Requirements:
- BookRequestPolicy
- BookRequestResource
- FormRequests
- BookRequestService
- pagination
- filters
- buyer-only update/delete/close
- Feature tests

## Do Not Implement

- frontend pages
- messages
- classrooms
- notes
- admin

## Validation Agent

`test-agent`

Run:

```bash
cd backend
php artisan test
```

## Review Agent

`reviewer-agent`

## Stop Rule

After review, stop and wait for human commit.

---

# Task 8: Book Requests Frontend

## Implementation Agent

`frontend-agent`

## Task

Create:
- `/requests`
- `/requests/new`
- `/requests/[id]`
- `frontend/src/services/bookRequests.ts`
- `frontend/src/types/bookRequest.ts`
- RequestCard
- RequestFilters
- CreateRequestForm

Requirements:
- list requests
- filter requests
- create request
- request detail
- buyer can close request

## Do Not Implement

- messages pages
- classrooms pages
- notes pages
- admin pages

## Validation Agent

`test-agent`

Run:

```bash
cd frontend
npm run lint
npm run build
```

## Review Agent

`reviewer-agent`

## Stop Rule

After review, stop and wait for human commit.

---

# Task 9A: Conversations Backend

## Implementation Agent

`backend-agent`

## Task

Implement conversations and messages backend.

Endpoints:
```http
GET /api/conversations
GET /api/conversations/{id}
POST /api/conversations
GET /api/conversations/{id}/messages
POST /api/conversations/{id}/messages
```

Rules:
- only conversation members can view
- only conversation members can send
- conversation can be linked to book or book_request
- MVP does not require realtime

## Do Not Implement

- frontend pages
- Laravel Reverb realtime
- admin UI

## Validation Agent

`test-agent`

## Review Agent

`reviewer-agent`

## Stop Rule

After review, stop and wait for human commit.

---

# Task 9B: Conversations Frontend

## Implementation Agent

`frontend-agent`

## Task

Create:
- `/messages`
- `/messages/[id]`
- ConversationList
- MessageBubble
- MessageInput

MVP can use polling or manual refresh.

Do not implement realtime yet.

## Validation Agent

`test-agent`

## Review Agent

`reviewer-agent`

## Stop Rule

After review, stop and wait for human commit.

---

# Task 10A: Classrooms Backend

## Implementation Agent

`backend-agent`

## Task

Implement classroom backend.

Requirements:
- classroom creation
- join code
- membership
- owner/moderator/member roles
- classroom APIs
- private classroom access rules

## Validation Agent

`test-agent`

## Review Agent

`reviewer-agent`

## Stop Rule

After review, stop and wait for human commit.

---

# Task 10B: Classrooms Frontend

## Implementation Agent

`frontend-agent`

## Task

Create:
- `/classes`
- `/classes/new`
- `/classes/[id]`
- ClassroomCard
- CreateClassroomForm
- JoinClassroomForm
- MemberList

## Validation Agent

`test-agent`

## Review Agent

`reviewer-agent`

## Stop Rule

After review, stop and wait for human commit.

---

# Task 11A: Notes Backend

## Implementation Agent

`backend-agent`

## Task

Implement notes backend.

Requirements:
- notes API
- note permissions
- visibility rules
- note policies

## Validation Agent

`test-agent`

## Review Agent

`reviewer-agent`

## Stop Rule

After review, stop and wait for human commit.

---

# Task 11B: Notes Frontend

## Implementation Agent

`frontend-agent`

## Task

Create:
- `/notes`
- `/notes/new`
- `/notes/[id]`
- NoteCard
- CreateNoteForm
- VisibilitySelector

## Validation Agent

`test-agent`

## Review Agent

`reviewer-agent`

## Stop Rule

After review, stop and wait for human commit.

---

# Task 12A: Flashcards Backend

## Implementation Agent

`backend-agent`

## Task

Implement flashcards backend API.

## Validation Agent

`test-agent`

## Review Agent

`reviewer-agent`

## Stop Rule

After review, stop and wait for human commit.

---

# Task 12B: Flashcards Frontend

## Implementation Agent

`frontend-agent`

## Task

Create:
- `/notes/[id]/flashcards`
- FlashcardViewer
- FlashcardEditor

## Validation Agent

`test-agent`

## Review Agent

`reviewer-agent`

## Stop Rule

After review, stop and wait for human commit.

---

# Task 13A: Reports Backend

## Implementation Agent

`backend-agent`

## Task

Implement reports backend.

Endpoints:
- `POST /api/reports`
- admin report APIs

## Validation Agent

`test-agent`

## Review Agent

`reviewer-agent`

## Stop Rule

After review, stop and wait for human commit.

---

# Task 13B: Reports Frontend

## Implementation Agent

`frontend-agent`

## Task

Create:
- ReportButton
- report modal

Do not build full admin UI yet.

## Validation Agent

`test-agent`

## Review Agent

`reviewer-agent`

## Stop Rule

After review, stop and wait for human commit.

---

# Task 14A: Admin Backoffice Backend

## Implementation Agent

`backend-agent`

## Task

Implement admin backend APIs.

Endpoints:
- `/api/admin/users`
- `/api/admin/books`
- `/api/admin/book-requests`
- `/api/admin/notes`
- `/api/admin/classrooms`
- `/api/admin/reports`
- `/api/admin/schools`

Requirements:
- authenticated
- role = admin
- no admin UI in Laravel

## Validation Agent

`test-agent`

## Review Agent

`reviewer-agent`

## Stop Rule

After review, stop and wait for human commit.

---

# Task 14B: Admin Backoffice Frontend

## Implementation Agent

`frontend-agent`

## Task

Create:
- `/admin`
- `/admin/users`
- `/admin/books`
- `/admin/requests`
- `/admin/notes`
- `/admin/classrooms`
- `/admin/reports`
- `/admin/schools`

Requirements:
- admin-only route protection
- tables
- filters
- moderation actions
- confirmation dialogs

## Validation Agent

`test-agent`

## Review Agent

`reviewer-agent`

## Stop Rule

After review, stop and wait for human commit.
