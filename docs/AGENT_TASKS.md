# LibroSchool Agent Tasks

## Rule For All Agents

The full plan is context only.

Agents must execute only the assigned phase.

Agents must stop after completing the assigned phase.

Agents must not start the next phase automatically.

## Task 1: Database Foundation Agent

Role:
Database Agent

Read:
- AGENTS.md
- CODEBUDDY.md
- docs/DATABASE_PLAN.md
- docs/DATABASE.md
- .codebuddy/rules/04-database.md

Task:
Create migrations, models, relationships, factories, and seeders.

Do not create:
- controllers
- API endpoints
- frontend pages
- admin pages

Validation:

```bash
cd backend
php artisan migrate:fresh --seed
```

Expected output:
- list of migrations
- list of models
- list of factories/seeders
- migration command result

## Task 2: Auth and Schools Backend Agent

Role:
Backend Agent

Read:
- docs/BACKEND_PLAN.md
- docs/API.md
- docs/SECURITY.md

Task:
Implement Auth and Schools APIs.

Endpoints:

```http
POST /api/register
POST /api/login
POST /api/logout
GET /api/me
PUT /api/me
GET /api/schools
GET /api/schools/{id}
POST /api/schools
```

Do not implement:
- books
- requests
- messages
- classrooms
- notes
- admin UI

Validation:

```bash
cd backend
php artisan test
```

## Task 3: Auth and Schools Frontend Agent

Role:
Frontend Agent

Read:
- docs/FRONTEND_PLAN.md
- docs/UI.md
- docs/API.md

Task:
Implement:

```text
/login
/register
/dashboard
/profile
SchoolSelector
```

Files:

```text
frontend/src/services/auth.ts
frontend/src/services/schools.ts
frontend/src/types/user.ts
frontend/src/types/school.ts
frontend/src/components/SchoolSelector.tsx
```

Do not implement:
- books pages
- requests pages
- admin pages

Validation:

```bash
cd frontend
npm run lint
npm run build
```

## Task 4: Books Backend Agent

Role:
Backend Agent

Task:
Implement books API.

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
- FormRequests
- BookService
- Feature tests

Do not implement image upload in this task.

## Task 5: Book Image Upload Backend Agent

Role:
Backend Agent

Task:
Implement Cloudflare R2 book image upload.

Endpoint:

```http
POST /api/books/{id}/images
```

Requirements:
- only seller can upload
- jpg/jpeg/png/webp only
- max 5MB
- save url and path
- update .env.example

## Task 6: Books Frontend Agent

Role:
Frontend Agent

Task:
Implement:

```text
/books
/books/new
/books/[id]
```

Components:

```text
BookCard
BookFilters
CreateBookForm
ImageUploader
```

Services/types:

```text
frontend/src/services/books.ts
frontend/src/types/book.ts
```

## Task 7: Book Requests Backend Agent

Role:
Backend Agent

Task:
Implement book requests API.

Endpoints:

```http
GET /api/book-requests
GET /api/book-requests/{id}
POST /api/book-requests
PUT /api/book-requests/{id}
DELETE /api/book-requests/{id}
POST /api/book-requests/{id}/close
```

## Task 8: Book Requests Frontend Agent

Role:
Frontend Agent

Task:
Implement:

```text
/requests
/requests/new
/requests/[id]
```

Components:

```text
RequestCard
RequestFilters
CreateRequestForm
```

## Task 9: Conversations Agent

Task:
Implement conversations and messages.

Pages:

```text
/messages
/messages/[id]
```

MVP does not require realtime.

## Task 10: Classrooms Agent

Task:
Implement classroom API and UI.

Pages:

```text
/classes
/classes/new
/classes/[id]
```

## Task 11: Notes Agent

Task:
Implement notes API and UI.

Pages:

```text
/notes
/notes/new
/notes/[id]
```

## Task 12: Flashcards Agent

Task:
Implement flashcards API and UI.

Page:

```text
/notes/[id]/flashcards
```

## Task 13: Reports Agent

Task:
Implement reports.

Features:
- ReportButton
- POST /api/reports
- admin report API

## Task 14: Admin Backoffice Agent

Task:
Implement admin backoffice.

Pages:

```text
/admin
/admin/users
/admin/books
/admin/requests
/admin/notes
/admin/classrooms
/admin/reports
/admin/schools
```

Do not build admin before reports exist.
