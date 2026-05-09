# LibroSchool API Specification

## Base URL

```text
/api
```

## Authentication

Authentication uses Laravel Sanctum.

Protected endpoints require authenticated user.

## Response Style

All API responses should use JSON.

List endpoints must be paginated.

Validation errors should return standard Laravel validation error format.

## Auth Endpoints

```http
POST /api/register
POST /api/login
POST /api/logout
GET /api/me
PUT /api/me
```

### POST /api/register

Create a new user.

Fields:
- name
- email
- password
- password_confirmation

Default:
- role = student

### POST /api/login

Login user.

Fields:
- email
- password

### POST /api/logout

Logout current user.

### GET /api/me

Return current authenticated user.

### PUT /api/me

Update current user profile.

Allowed fields:
- name
- school_id
- grade
- track

## Schools Endpoints

```http
GET /api/schools
GET /api/schools/{id}
POST /api/schools
```

### GET /api/schools

Paginated school list.

Filters:
- search
- city
- province
- region
- school_type

### POST /api/schools

Admin only.

Create a school manually.

## Books Endpoints

```http
GET /api/books
GET /api/books/{id}
POST /api/books
PUT /api/books/{id}
DELETE /api/books/{id}
POST /api/books/{id}/images
POST /api/books/{id}/mark-reserved
POST /api/books/{id}/mark-sold
```

### GET /api/books

Paginated book list.

Filters:
- search
- school_id
- grade
- track
- subject
- isbn
- min_price
- max_price
- condition
- status

Default visible status:
- available

### POST /api/books

Create a book listing.

Required fields:
- school_id
- title
- condition
- price

Optional fields:
- isbn
- subject
- grade
- track
- publisher
- author
- description

### PUT /api/books/{id}

Only seller can update.

### DELETE /api/books/{id}

Only seller or admin can delete.

### POST /api/books/{id}/images

Only seller can upload images.

Allowed file types:
- jpg
- jpeg
- png
- webp

Max size:
- 5MB

### POST /api/books/{id}/mark-reserved

Only seller can mark reserved.

### POST /api/books/{id}/mark-sold

Only seller can mark sold.

## Book Requests Endpoints

```http
GET /api/book-requests
GET /api/book-requests/{id}
POST /api/book-requests
PUT /api/book-requests/{id}
DELETE /api/book-requests/{id}
POST /api/book-requests/{id}/close
```

### GET /api/book-requests

Paginated request list.

Filters:
- search
- school_id
- grade
- track
- subject
- isbn
- max_price
- status

Default visible status:
- open

### POST /api/book-requests

Create a book request.

Required fields:
- school_id
- title

Optional fields:
- isbn
- subject
- grade
- track
- max_price
- description

### PUT /api/book-requests/{id}

Only buyer can update.

### POST /api/book-requests/{id}/close

Only buyer can close.

## Conversations Endpoints

```http
GET /api/conversations
GET /api/conversations/{id}
POST /api/conversations
GET /api/conversations/{id}/messages
POST /api/conversations/{id}/messages
```

### GET /api/conversations

Return conversations where current user is a member.

### POST /api/conversations

Create or get conversation.

Can be linked to:
- book_id
- book_request_id

### GET /api/conversations/{id}/messages

Only conversation members can view.

### POST /api/conversations/{id}/messages

Only conversation members can send.

Fields:
- body

## Classrooms Endpoints

```http
GET /api/classrooms
GET /api/classrooms/{id}
POST /api/classrooms
PUT /api/classrooms/{id}
DELETE /api/classrooms/{id}
POST /api/classrooms/join
POST /api/classrooms/{id}/leave
GET /api/classrooms/{id}/members
DELETE /api/classrooms/{id}/members/{user_id}
```

### POST /api/classrooms

Create classroom.

Required fields:
- school_id
- academic_year
- grade
- section

Optional fields:
- track
- join_policy
- visibility

System generates:
- name
- join_code

### POST /api/classrooms/join

Join classroom.

Fields:
- join_code

### GET /api/classrooms/{id}/members

Only members can view.

## Notes Endpoints

```http
GET /api/notes
GET /api/notes/{id}
POST /api/notes
PUT /api/notes/{id}
DELETE /api/notes/{id}
POST /api/notes/{id}/permissions
DELETE /api/notes/{id}/permissions/{user_id}
```

### GET /api/notes

Return notes visible to current user.

Filters:
- search
- school_id
- classroom_id
- subject
- grade
- visibility
- mode

### POST /api/notes

Create note.

Fields:
- title
- content
- school_id
- classroom_id
- subject
- grade
- visibility
- mode

### GET /api/notes/{id}

Only authorized users can view.

### PUT /api/notes/{id}

Only author can update.

## Flashcards Endpoints

```http
GET /api/notes/{note_id}/flashcards
POST /api/notes/{note_id}/flashcards
PUT /api/flashcards/{id}
DELETE /api/flashcards/{id}
```

Flashcards belong to a note.

Only note author can create/update/delete.

Authorized note viewers can view flashcards.

## Reports Endpoints

```http
POST /api/reports
GET /api/admin/reports
POST /api/admin/reports/{id}/resolve
```

### POST /api/reports

Authenticated users can report content.

Fields:
- target_type
- target_id
- reason

## Admin Endpoints

Admin endpoints should be under:

```text
/api/admin
```

Admin MVP:
- manage users
- manage books
- manage requests
- manage notes
- manage reports
- manage schools

## Admin API

Admin API endpoints must live under:

```text
/api/admin
```

The admin API is consumed by the Next.js backoffice UI.

The admin UI is not built in Laravel Blade.

Planned admin endpoints:

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

Admin endpoints require:

* authenticated user
* role = admin