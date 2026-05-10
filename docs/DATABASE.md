# LibroSchool Database Schema

Database: PostgreSQL

All schema changes must use Laravel migrations.

## users

Purpose:
Store platform users.

Fields:
```text
id
name
email
email_verified_at
password
role string allowed: student, teacher, admin
school_id nullable foreign schools.id
grade nullable
track nullable
remember_token
created_at
updated_at
```

Notes:
- default role is student
- school_id can be null during registration

## schools

Purpose:
Store Italian high school data.

Fields:
```text
id
code unique nullable
name
city nullable
province nullable
region nullable
country default Italy
school_type nullable
created_at
updated_at
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
condition string allowed: new, very_good, good, acceptable
price decimal(8,2)
description text nullable
status string allowed: available, reserved, sold, hidden
created_at
updated_at
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
Store book image references.

Fields:
```text
id
book_id foreign books.id
url
path
sort_order integer default 0
created_at
updated_at
```

Indexes:
```text
book_id
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
description text nullable
status string allowed: open, matched, closed, hidden
created_at
updated_at
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
join_policy string allowed: open, code, approval
visibility string allowed: public, private
is_verified boolean default false
status string allowed: active, reported, locked, deleted
created_at
updated_at
```

Unique constraint:
```text
school_id + academic_year + grade + section + track
```

Indexes:
```text
school_id
owner_id
join_code
academic_year
grade
section
track
status
```

## classroom_members

Purpose:
Store classroom membership.

Fields:
```text
id
classroom_id foreign classrooms.id
user_id foreign users.id
role string allowed: owner, moderator, member
status string allowed: active, pending, banned
created_at
updated_at
```

Unique constraint:
```text
classroom_id + user_id
```

Indexes:
```text
classroom_id
user_id
role
status
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
content longtext nullable
visibility string allowed: public, private, classroom, specific_users
mode string allowed: normal, flashcard
created_at
updated_at
```

Indexes:
```text
author_id
school_id
classroom_id
visibility
mode
subject
grade
created_at
```

## note_permissions

Purpose:
Store user-specific note permissions.

Fields:
```text
id
note_id foreign notes.id
user_id foreign users.id
created_at
updated_at
```

Unique constraint:
```text
note_id + user_id
```

Indexes:
```text
note_id
user_id
```

## flashcards

Purpose:
Store flashcards for note mode.

Fields:
```text
id
note_id foreign notes.id
front text
back text
sort_order integer default 0
created_at
updated_at
```

Indexes:
```text
note_id
sort_order
```

## conversations

Purpose:
Store conversations.

Fields:
```text
id
book_id nullable foreign books.id
book_request_id nullable foreign book_requests.id
created_at
updated_at
```

Indexes:
```text
book_id
book_request_id
created_at
```

## conversation_members

Purpose:
Store conversation participants.

Fields:
```text
id
conversation_id foreign conversations.id
user_id foreign users.id
created_at
updated_at
```

Unique constraint:
```text
conversation_id + user_id
```

Indexes:
```text
conversation_id
user_id
```

## messages

Purpose:
Store messages.

Fields:
```text
id
conversation_id foreign conversations.id
sender_id foreign users.id
body text
created_at
updated_at
```

Indexes:
```text
conversation_id
sender_id
created_at
```

## reports

Purpose:
Store user reports.

Fields:
```text
id
reporter_id foreign users.id
target_type
target_id
reason text
status string allowed: open, reviewed, dismissed
created_at
updated_at
```

Indexes:
```text
reporter_id
target_type
target_id
status
created_at
```

## Important Rules

- Do not create schema manually outside migrations.
- Do not remove fields without migration and documentation update.
- Update this file whenever schema changes.
