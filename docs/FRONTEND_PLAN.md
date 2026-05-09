# LibroSchool Frontend Plan

## Frontend Definition

The frontend is the Next.js web application.

It contains:
- public pages
- authenticated student pages
- future admin/backoffice pages

## Agent Workflow

All frontend phases must be executed by `frontend-agent`.

After `frontend-agent` completes:
- `test-agent` must run lint/build
- `reviewer-agent` must review frontend diff and scope

`api-agent` may be used to check frontend services against backend API.

## Frontend Tech Stack

```text
Next.js
TypeScript
Tailwind CSS
shadcn/ui
React Hook Form
Zod
```

## Frontend Rules

- Use mobile-first design.
- Keep pages simple.
- API calls must live in src/services.
- Types must live in src/types.
- Feature components should live in src/features.
- Do not put complex API logic directly inside page components.
- Do not directly access the database.
- Do not enforce permissions only on frontend.

## Suggested Directory Structure

```text
frontend/src/app
frontend/src/components
frontend/src/features
frontend/src/services
frontend/src/types
frontend/src/lib
```

## Public Pages

### `/`

Purpose:
Landing page.

Content:
- LibroSchool title
- short description
- login/register CTA

MVP text:

```text
LibroSchool
A student book marketplace and learning resource platform.
```

### `/login`

Purpose:
User login.

Fields:
- email
- password

Behavior:
- login success redirects to /dashboard
- show validation errors
- show API errors

### `/register`

Purpose:
User registration.

Fields:
- name
- email
- password
- password_confirmation

Behavior:
- register success redirects to /dashboard

## Authenticated User Pages

### `/dashboard`

Purpose:
Authenticated landing page.

Content:
- welcome message
- profile summary
- quick actions

Quick actions:
- Sell a book
- Request a book
- Browse books
- Browse requests
- My classes
- My notes
- Messages

### `/profile`

Purpose:
User profile.

Fields:
- name
- email read-only
- school_id
- grade
- track

Components:
- SchoolSelector
- GradeSelector
- TrackSelector

Behavior:
- user can update profile

## Books Pages

### `/books`

Purpose:
Book marketplace list.

Features:
- paginated list
- search
- filters
- BookCard
- link to create book

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

### `/books/new`

Purpose:
Create book listing.

Fields:
- title
- isbn
- school_id
- subject
- grade
- track
- publisher
- author
- condition
- price
- description
- images

Behavior:
- create book
- upload images
- redirect to book detail

### `/books/[id]`

Purpose:
Book detail page.

Features:
- image gallery
- book details
- seller information
- contact seller button
- report button

If current user is seller:
- edit
- delete
- mark reserved
- mark sold

## Book Requests Pages

### `/requests`

Purpose:
Book request list.

Features:
- paginated list
- search
- filters
- RequestCard
- link to create request

Filters:
- search
- school_id
- grade
- track
- subject
- isbn
- max_price
- status

### `/requests/new`

Purpose:
Create book request.

Fields:
- title
- isbn
- school_id
- subject
- grade
- track
- max_price
- description

### `/requests/[id]`

Purpose:
Request detail.

Features:
- request details
- contact buyer button
- report button

If current user is buyer:
- edit
- delete
- close request

## Messages Pages

### `/messages`

Purpose:
Conversation list.

Features:
- list conversations
- show related book/request
- show latest message preview

### `/messages/[id]`

Purpose:
Conversation detail.

Features:
- message list
- message input
- send message

MVP can use normal API refresh.

Realtime can be added later.

## Classrooms Pages

### `/classes`

Purpose:
Classroom list.

Features:
- my classrooms
- search classrooms
- create classroom CTA
- join classroom CTA

### `/classes/new`

Purpose:
Create classroom.

Fields:
- school_id
- academic_year
- grade
- section
- track
- join_policy
- visibility

System generates:
- name
- join_code

### `/classes/[id]`

Purpose:
Classroom detail.

Features:
- classroom info
- members
- class books
- class requests
- class notes
- join code display for owner
- leave classroom
- report classroom

Owner/moderator features:
- manage members
- update settings
- remove member

## Notes Pages

### `/notes`

Purpose:
Visible notes list.

Features:
- search
- filters
- NoteCard

Filters:
- search
- school_id
- classroom_id
- subject
- grade
- visibility
- mode

### `/notes/new`

Purpose:
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

### `/notes/[id]`

Purpose:
Note detail.

Features:
- view note
- edit/delete if author
- report note
- link to flashcards if mode is flashcard

### `/notes/[id]/flashcards`

Purpose:
Flashcard study page.

Features:
- flip card
- previous
- next
- random

If author:
- add card
- edit card
- delete card

## Shared Components

```text
AppLayout
AuthLayout
DashboardCard
PageHeader
EmptyState
LoadingState
ConfirmDialog
Pagination
SearchInput
FilterBar
SchoolSelector
GradeSelector
TrackSelector
```

## Feature Components

Books:

```text
BookCard
BookFilters
CreateBookForm
ImageUploader
```

Requests:

```text
RequestCard
RequestFilters
CreateRequestForm
```

Classrooms:

```text
ClassroomCard
CreateClassroomForm
JoinClassroomForm
MemberList
```

Notes:

```text
NoteCard
CreateNoteForm
VisibilitySelector
```

Messages:

```text
ConversationList
MessageBubble
MessageInput
```

Flashcards:

```text
FlashcardViewer
FlashcardEditor
```

Reports:

```text
ReportButton
```

## Frontend Validation Commands

```bash
cd frontend
npm run lint
npm run build
```
