# LibroSchool Security Rules

## Security Principle

LibroSchool involves minors and school-related data.

Security must be enforced on the backend.

Frontend UI checks are not security.

## Authentication

Use Laravel Sanctum.

Protected APIs require authenticated user.

Admin APIs require admin role.

## Authorization

Use Laravel Policies.

Every sensitive resource must have backend authorization.

## Books

Rules:
- authenticated users can view available books
- seller can create books
- seller can update own books
- seller can delete own books
- seller can mark own books as reserved or sold
- admin can hide or delete any book

Users must not edit another user's book.

## Book Requests

Rules:
- authenticated users can view open requests
- buyer can create requests
- buyer can update own requests
- buyer can close own requests
- admin can hide or delete any request

Users must not close another user's request.

## Classrooms

Rules:
- authenticated users can create classrooms
- first creator becomes owner
- owner can update classroom settings
- owner can assign moderators
- owner can remove members
- moderator can manage limited content
- member can view classroom content
- non-member cannot view private classroom content

Classroom join policies:
- open
- code
- approval

MVP default:
- code

## Notes

Visibility rules:

### public

Visible to authenticated users.

### private

Visible only to author.

### classroom

Visible only to members of the classroom.

### specific_users

Visible only to:
- author
- users listed in note_permissions

Only note author can update or delete a note.

## Flashcards

Flashcards belong to notes.

Authorized note viewers can view flashcards.

Only note author can create, update, or delete flashcards.

## Conversations

Rules:
- only conversation members can view conversation
- only conversation members can view messages
- only conversation members can send messages

Users must not read conversations they do not belong to.

## File Uploads

Allowed image types:
- jpg
- jpeg
- png
- webp

Max size:
- 5MB

Images must be stored in Cloudflare R2.

Do not store secrets in source code.

Do not allow arbitrary file uploads.

## Reports

Authenticated users can report:
- books
- book requests
- notes
- classrooms
- messages
- users

Admin can review reports.

## Input Validation

Use FormRequest for Laravel validation.

Validate:
- required fields
- string length
- enum values
- numeric ranges
- file types
- file size
- foreign key existence

## Data Exposure

Do not expose:
- password hashes
- tokens
- private notes
- unauthorized messages
- admin-only data
- secrets
- raw internal errors

## Required Security Tests

Backend tests must cover:
- user cannot edit another user's book
- user cannot close another user's request
- private note is hidden from other users
- classroom note is hidden from non-members
- non-member cannot read conversation messages
- invalid file upload is rejected
- unauthenticated requests are rejected where required