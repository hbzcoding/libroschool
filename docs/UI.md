# LibroSchool UI Guidelines

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