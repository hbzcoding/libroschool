# LibroSchool UI Guidelines

## DESIGN.md Priority

`DESIGN.md` is the authoritative UI design system for colors, typography, spacing, components, borders, elevation, and responsive behavior.

This file provides product-specific UI structure and page guidance. If this file conflicts with `DESIGN.md`, follow `DESIGN.md`.

## Design Style

LibroSchool UI should be:
- mobile-first
- simple
- clean
- student-friendly
- trustworthy
- card-based
- easy to scan

Do not over-design.

Do not use heavy animations.

## Main Navigation

Mobile first.

Suggested mobile bottom navigation:
- Home
- Books
- Requests
- Classes
- Profile

Desktop can use:
- sidebar
- top navigation

## Main Pages

Public:
```text
/
login
register
```

Authenticated:
```text
/dashboard
/books
/books/new
/books/[id]
/requests
/requests/new
/requests/[id]
/classes
/classes/new
/classes/[id]
/notes
/notes/new
/notes/[id]
/notes/[id]/flashcards
/messages
/messages/[id]
/profile
```

Admin:
```text
/admin
/admin/users
/admin/books
/admin/requests
/admin/notes
/admin/reports
/admin/schools
```

## Core Components

### BookCard

Shows:
- image
- title
- price
- condition
- school
- grade
- subject
- status

Primary action:
- view details

### RequestCard

Shows:
- title
- max price
- school
- grade
- subject
- status

Primary action:
- view details

### ClassroomCard

Shows:
- class name
- school
- academic year
- member count
- join policy

### NoteCard

Shows:
- title
- subject
- grade
- visibility
- mode
- author
- created date

### FlashcardViewer

Actions:
- flip card
- previous
- next
- random

### ImageUploader

Requirements:
- preview selected images
- show upload progress
- show error messages
- enforce allowed types
- enforce max size

## Forms

Use:
- React Hook Form
- Zod validation
- clear error messages

Forms must have:
- loading state
- success state
- error state

## Empty States

Every list page must show a useful empty state.

Examples:
- No books yet. Publish the first book.
- No requests yet. Create a request.
- No classroom yet. Create or join one.
- No notes yet. Share your first note.

## Language

MVP can start in English or Italian.

Product is for Italian students, so Italian UI should be supported later.

Do not hardcode text in too many places if avoidable.

## Accessibility

Use:
- semantic HTML
- readable contrast
- visible focus states
- button labels
- form labels

## Admin / Backoffice UI

The admin/backoffice UI is part of the project.

It must be implemented in the Next.js frontend, not in Laravel Blade.

Admin routes:

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

Admin dashboard should include:

* summary cards

  * total users
  * total books
  * total requests
  * total notes
  * open reports
* recent reports
* latest user registrations
* content moderation shortcuts

Admin users page:

* list users
* search users
* view user detail
* ban or unban user
* change role if needed

Admin books page:

* list books
* filter by status
* view book detail
* hide book
* delete book

Admin requests page:

* list requests
* filter by status
* hide request
* delete request

Admin notes page:

* list notes
* filter by visibility
* hide or delete note

Admin classrooms page:

* list classrooms
* lock classroom
* delete classroom
* view members

Admin reports page:

* list reports
* view reported target
* mark resolved
* dismiss report

Admin schools page:

* list schools
* create school
* edit school
* delete school if unused

Admin UI style:

* clear tables
* search and filters
* moderation actions
* confirmation dialogs for destructive actions
* no heavy animations
