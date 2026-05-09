# LibroSchool Roadmap

## Phase 0: Project Rules and Documentation

Create:
- AGENTS.md
- CODEBUDDY.md
- docs
- .codebuddy/rules

No business code.

## Phase 1: Project Initialization

Create:
- Laravel backend in /backend
- Next.js frontend in /frontend
- PostgreSQL configuration
- Sanctum setup
- basic health check endpoint
- basic frontend layout

Do not implement business modules yet.

## Phase 2: Auth

Backend:
- register
- login
- logout
- me
- update profile
- user role
- school_id
- grade
- track

Frontend:
- login page
- register page
- dashboard
- profile page

## Phase 3: Schools

Backend:
- schools table
- schools API
- search and filters
- admin create

Frontend:
- SchoolSelector
- profile school selection

## Phase 4: Books

Backend:
- books table
- book_images table
- books API
- book policies
- filters
- mark reserved
- mark sold

Frontend:
- books list
- create book
- book detail
- edit own book
- mark sold/reserved

## Phase 5: Cloudflare R2 Upload

Backend:
- configure S3-compatible storage
- upload book images
- validate image type and size
- save URL and path

Frontend:
- ImageUploader
- upload progress
- upload error state

## Phase 6: Book Requests

Backend:
- book_requests table
- request API
- request policies
- filters
- close request

Frontend:
- requests list
- create request
- request detail

## Phase 7: Conversations

Backend:
- conversations
- conversation_members
- messages
- conversation authorization

Frontend:
- conversation list
- conversation detail
- send message

Realtime can be added later with Laravel Reverb.

## Phase 8: Classrooms

Backend:
- classrooms
- classroom_members
- join code
- classroom roles
- classroom policies

Frontend:
- class list
- create class
- join class
- class detail
- members list

## Phase 9: Notes

Backend:
- notes
- note_permissions
- visibility rules
- note policies

Frontend:
- notes list
- create note
- note detail
- classroom notes

## Phase 10: Flashcards

Backend:
- flashcards table
- flashcard API

Frontend:
- flashcard viewer
- flip interaction
- previous/next/random

## Phase 11: Reports and Admin

Backend:
- reports
- admin endpoints

Frontend:
- report buttons
- admin dashboard
- report review

## Future

Possible future features:
- Flutter app
- realtime notifications
- premium promoted listings
- AI summaries
- parent learning reports
- official school partnerships

Do not build future features until MVP is validated.

## Admin / Backoffice Phase Clarification

Backoffice is part of the project.

However, it must not be implemented during Phase 1 project initialization.

Admin/backoffice should be implemented after:

1. Auth
2. Schools
3. Books
4. Book Requests
5. Conversations
6. Classrooms
7. Notes
8. Reports

Admin/backoffice implementation includes:

Backend:

* /api/admin/users
* /api/admin/books
* /api/admin/book-requests
* /api/admin/notes
* /api/admin/classrooms
* /api/admin/reports
* /api/admin/schools

Frontend:

* /admin
* /admin/users
* /admin/books
* /admin/requests
* /admin/notes
* /admin/classrooms
* /admin/reports
* /admin/schools