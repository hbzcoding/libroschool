# LibroSchool Admin Backoffice Plan

## Admin Definition

The admin/backoffice UI is part of the project.

It must be built in the Next.js frontend.

It must not be built with Laravel Blade.

Admin frontend path:

```text
frontend/src/app/admin
```

Admin API path:

```text
/api/admin/*
```

## Admin Access Rule

Only authenticated users with role `admin` can access admin pages and admin APIs.

## Admin Phase Timing

Do not build admin pages during project initialization.

Build admin after:

1. Auth
2. Schools
3. Books
4. Book Requests
5. Conversations
6. Classrooms
7. Notes
8. Reports

## Admin Pages

### `/admin`

Purpose:
Admin dashboard.

Features:
- total users
- total books
- total requests
- total notes
- active classrooms
- open reports
- recent reports
- latest users
- moderation shortcuts

### `/admin/users`

Purpose:
User management.

Features:
- list users
- search users
- filter by role
- view user details
- ban/unban user
- change role if needed
- view user content summary

Table columns:

```text
name
email
role
school
grade
created_at
status
actions
```

### `/admin/books`

Purpose:
Book moderation.

Features:
- list all books
- filter by status
- filter by school
- search by title/isbn
- view book detail
- hide book
- delete book
- view seller

### `/admin/requests`

Purpose:
Book request moderation.

Features:
- list all requests
- filter by status
- search by title/isbn
- view request detail
- hide request
- delete request
- view buyer

### `/admin/notes`

Purpose:
Note moderation.

Features:
- list notes
- filter by visibility
- filter by school/classroom
- view note detail
- hide/delete note
- view author

### `/admin/classrooms`

Purpose:
Classroom moderation.

Features:
- list classrooms
- filter by school
- filter by status
- view classroom details
- view members
- lock classroom
- delete classroom

### `/admin/reports`

Purpose:
Report management.

Features:
- list reports
- filter by status
- filter by target_type
- view reported target
- resolve report
- dismiss report
- moderation actions

### `/admin/schools`

Purpose:
School data management.

Features:
- list schools
- search schools
- create school
- edit school
- delete unused school
- future bulk import

## Admin API Endpoints

```http
GET /api/admin/users
GET /api/admin/users/{id}
PUT /api/admin/users/{id}
POST /api/admin/users/{id}/ban

GET /api/admin/books
GET /api/admin/books/{id}
POST /api/admin/books/{id}/hide
DELETE /api/admin/books/{id}

GET /api/admin/book-requests
GET /api/admin/book-requests/{id}
POST /api/admin/book-requests/{id}/hide
DELETE /api/admin/book-requests/{id}

GET /api/admin/notes
GET /api/admin/notes/{id}
POST /api/admin/notes/{id}/hide
DELETE /api/admin/notes/{id}

GET /api/admin/classrooms
GET /api/admin/classrooms/{id}
POST /api/admin/classrooms/{id}/lock
DELETE /api/admin/classrooms/{id}

GET /api/admin/reports
GET /api/admin/reports/{id}
POST /api/admin/reports/{id}/resolve

GET /api/admin/schools
POST /api/admin/schools
PUT /api/admin/schools/{id}
DELETE /api/admin/schools/{id}
```

## Admin UI Components

```text
AdminLayout
AdminSidebar
AdminStatCard
AdminTable
AdminFilterBar
ModerationActions
AdminConfirmDialog
ReportStatusBadge
UserRoleBadge
```

## Admin UI Style

- simple
- table-based
- clear actions
- filters and search
- confirmation dialogs for destructive actions
- no heavy animations
- no public access
