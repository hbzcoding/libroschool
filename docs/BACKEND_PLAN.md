# LibroSchool Backend Plan

## Backend Definition

The backend is Laravel JSON API only.

Do not build Blade pages.

Do not build Laravel-rendered admin UI.

Admin/backoffice UI belongs in the Next.js frontend.

## Backend Tech Stack

```text
Laravel 12
PHP 8.3+
PostgreSQL
Laravel Sanctum
Laravel Reverb later
Cloudflare R2
```

## Backend Architecture Rules

Use:

```text
FormRequest for validation
Policy for authorization
Resource for API responses
Service classes for business logic
Eloquent relationships
Feature tests for critical behavior
```

Controllers must stay thin.

## API Prefix

All API endpoints are under:

```text
/api
```

Admin endpoints are under:

```text
/api/admin
```

## Phase 3: Auth and Schools Backend

### Auth Endpoints

```http
POST /api/register
POST /api/login
POST /api/logout
GET /api/me
PUT /api/me
```

Requirements:

- Laravel Sanctum
- register creates user with role student
- login returns authenticated session/token approach chosen by implementation
- logout invalidates session/token
- me returns current user
- update profile allows name, school_id, grade, track
- password hash is never returned
- protected endpoints require auth:sanctum

Files expected:

```text
Http/Controllers/Api/AuthController.php
Http/Requests/RegisterRequest.php
Http/Requests/LoginRequest.php
Http/Requests/UpdateProfileRequest.php
Http/Resources/UserResource.php
```

Tests:

```text
user can register
user can login
authenticated user can get me
authenticated user can update profile
unauthenticated user cannot get me
```

### Schools Endpoints

```http
GET /api/schools
GET /api/schools/{id}
POST /api/schools
```

Requirements:

- list is paginated
- search by name/code/city/province/region
- filters: city, province, region, school_type
- create is admin only

Files expected:

```text
Http/Controllers/Api/SchoolController.php
Http/Requests/StoreSchoolRequest.php
Http/Resources/SchoolResource.php
Policies/SchoolPolicy.php
```

Tests:

```text
user can list schools
user can search schools
non-admin cannot create school
admin can create school
```

## Phase 5: Books Backend

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

- list is paginated
- default status is available
- filters: search, school_id, grade, track, subject, isbn, min_price, max_price, condition, status
- authenticated user can create book
- only seller can update/delete own book
- only seller can mark own book reserved/sold

Files expected:

```text
Http/Controllers/Api/BookController.php
Http/Requests/StoreBookRequest.php
Http/Requests/UpdateBookRequest.php
Http/Resources/BookResource.php
Policies/BookPolicy.php
Services/BookService.php
```

Tests:

```text
authenticated user can create book
guest cannot create book
user can list available books
user can filter books by school
seller can update own book
user cannot update another user's book
seller can mark own book sold
user cannot mark another user's book sold
```

## Phase 6: Book Image Upload

Endpoint:

```http
POST /api/books/{id}/images
```

Requirements:

- only seller can upload image
- allowed file types: jpg, jpeg, png, webp
- max size: 5MB
- use Cloudflare R2 through S3-compatible Laravel filesystem
- store url, path, sort_order in book_images

Files expected:

```text
Http/Requests/UploadBookImageRequest.php
Services/BookImageService.php
```

Tests:

```text
seller can upload image
non-seller cannot upload image
invalid file type is rejected
oversized file is rejected
```

## Phase 8: Book Requests Backend

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

- list is paginated
- default status is open
- filters: search, school_id, grade, track, subject, isbn, max_price, status
- authenticated user can create request
- only buyer can update/delete/close own request

Files expected:

```text
Http/Controllers/Api/BookRequestController.php
Http/Requests/StoreBookRequestRequest.php
Http/Requests/UpdateBookRequestRequest.php
Http/Resources/BookRequestResource.php
Policies/BookRequestPolicy.php
Services/BookRequestService.php
```

## Phase 10: Conversations Backend

Endpoints:

```http
GET /api/conversations
GET /api/conversations/{id}
POST /api/conversations
GET /api/conversations/{id}/messages
POST /api/conversations/{id}/messages
```

Requirements:

- only conversation members can view conversation
- only conversation members can view messages
- only conversation members can send messages
- conversation can be linked to book or book_request

## Phase 11: Classrooms Backend

Endpoints:

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

Requirements:

- first creator becomes owner
- join_code generated by system
- unique classroom constraint enforced
- owner can manage members
- non-member cannot view private classroom content

## Phase 12: Notes Backend

Endpoints:

```http
GET /api/notes
GET /api/notes/{id}
POST /api/notes
PUT /api/notes/{id}
DELETE /api/notes/{id}
POST /api/notes/{id}/permissions
DELETE /api/notes/{id}/permissions/{user_id}
```

Requirements:

- visibility rules enforced on backend
- public visible to authenticated users
- private visible only to author
- classroom visible only to classroom members
- specific_users visible only to author and permitted users

## Phase 13: Flashcards Backend

Endpoints:

```http
GET /api/notes/{note_id}/flashcards
POST /api/notes/{note_id}/flashcards
PUT /api/flashcards/{id}
DELETE /api/flashcards/{id}
```

## Phase 14: Reports Backend

Endpoints:

```http
POST /api/reports
GET /api/admin/reports
GET /api/admin/reports/{id}
POST /api/admin/reports/{id}/resolve
```

## Phase 15: Admin Backend

Admin endpoints:

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

Admin requirements:

- authenticated
- role = admin
- no admin UI in Laravel
