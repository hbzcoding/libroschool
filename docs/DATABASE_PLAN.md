# LibroSchool Database Plan

## Database

Use PostgreSQL.

Do not use SQLite for local development.

All schema changes must be created through Laravel migrations.

Do not manually create or delete business tables outside migrations.

## Laravel System Tables

Keep Laravel, Sanctum, session, cache, and queue-related tables as needed.

Likely tables to keep:

```text
users
password_reset_tokens
sessions
cache
cache_locks
jobs
job_batches
failed_jobs
personal_access_tokens
```

Do not delete these tables unless Laravel no longer needs them.

## Business Tables

Create the following LibroSchool business tables:

```text
schools
books
book_images
book_requests
classrooms
classroom_members
notes
note_permissions
flashcards
conversations
conversation_members
messages
reports
```

## users Changes

Add fields to users:

```text
role string default student
school_id nullable foreign key to schools.id
grade nullable string
track nullable string
```

Role values:

```text
student
teacher
admin
```

## schools

Purpose:
Store school data.

Fields:

```text
id
code nullable unique
name
city nullable
province nullable
region nullable
country default Italy
school_type nullable
timestamps
```

Indexes:

```text
code
name
city
province
region
school_type
```

## books

Purpose:
Store used book listings.

Fields:

```text
id
seller_id foreign users.id
school_id foreign schools.id
title
isbn nullable
subject nullable
grade nullable
track nullable
publisher nullable
author nullable
condition string
price decimal(8,2)
description nullable text
status string default available
timestamps
```

Allowed condition values:

```text
new
very_good
good
acceptable
```

Allowed status values:

```text
available
reserved
sold
hidden
```

Indexes:

```text
seller_id
school_id
isbn
grade
track
subject
status
created_at
```

## book_images

Purpose:
Store Cloudflare R2 image references.

Fields:

```text
id
book_id foreign books.id cascade delete
url
path
sort_order integer default 0
timestamps
```

## book_requests

Purpose:
Store book purchase requests.

Fields:

```text
id
buyer_id foreign users.id
school_id foreign schools.id
title
isbn nullable
subject nullable
grade nullable
track nullable
max_price decimal(8,2) nullable
description nullable text
status string default open
timestamps
```

Allowed status values:

```text
open
matched
closed
hidden
```

Indexes:

```text
buyer_id
school_id
isbn
grade
track
subject
status
created_at
```

## classrooms

Purpose:
Store user-generated classroom rooms.

Fields:

```text
id
school_id foreign schools.id
owner_id foreign users.id
name
grade
section
track nullable
academic_year
join_code unique
join_policy string default code
visibility string default private
is_verified boolean default false
status string default active
timestamps
```

Allowed join_policy values:

```text
open
code
approval
```

Allowed visibility values:

```text
public
private
```

Allowed status values:

```text
active
reported
locked
deleted
```

Unique constraint:

```text
school_id + academic_year + grade + section + track
```

## classroom_members

Purpose:
Store classroom membership.

Fields:

```text
id
classroom_id foreign classrooms.id cascade delete
user_id foreign users.id cascade delete
role string default member
status string default active
timestamps
```

Allowed role values:

```text
owner
moderator
member
```

Allowed status values:

```text
active
pending
banned
```

Unique constraint:

```text
classroom_id + user_id
```

## notes

Purpose:
Store study notes.

Fields:

```text
id
author_id foreign users.id
school_id nullable foreign schools.id
classroom_id nullable foreign classrooms.id
title
subject nullable
grade nullable
content nullable longText
visibility string default private
mode string default normal
timestamps
```

Allowed visibility values:

```text
public
private
classroom
specific_users
```

Allowed mode values:

```text
normal
flashcard
```

## note_permissions

Purpose:
Store user-specific note access.

Fields:

```text
id
note_id foreign notes.id cascade delete
user_id foreign users.id cascade delete
timestamps
```

Unique constraint:

```text
note_id + user_id
```

## flashcards

Purpose:
Store note flashcards.

Fields:

```text
id
note_id foreign notes.id cascade delete
front text
back text
sort_order integer default 0
timestamps
```

## conversations

Purpose:
Store buyer/seller conversations.

Fields:

```text
id
book_id nullable foreign books.id null on delete
book_request_id nullable foreign book_requests.id null on delete
timestamps
```

## conversation_members

Purpose:
Store conversation participants.

Fields:

```text
id
conversation_id foreign conversations.id cascade delete
user_id foreign users.id cascade delete
timestamps
```

Unique constraint:

```text
conversation_id + user_id
```

## messages

Purpose:
Store messages.

Fields:

```text
id
conversation_id foreign conversations.id cascade delete
sender_id foreign users.id
body text
timestamps
```

## reports

Purpose:
Store user reports.

Fields:

```text
id
reporter_id foreign users.id
target_type string
target_id unsignedBigInteger
reason text
status string default open
timestamps
```

Allowed status values:

```text
open
reviewed
dismissed
```

## Models To Create

```text
School
Book
BookImage
BookRequest
Classroom
ClassroomMember
Note
NotePermission
Flashcard
Conversation
ConversationMember
Message
Report
```

## Factories To Create

```text
SchoolFactory
BookFactory
BookRequestFactory
ClassroomFactory
NoteFactory
```

## Seeders To Create

```text
SchoolSeeder
DatabaseSeeder calls SchoolSeeder
```

## Database Validation Command

```bash
cd backend
php artisan migrate:fresh --seed
```

This command must succeed before moving to backend API work.
