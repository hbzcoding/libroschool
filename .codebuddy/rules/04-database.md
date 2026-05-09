---
description: PostgreSQL database rules
alwaysApply: true
enabled: true
---

# Database Rules

Database is PostgreSQL.

All schema changes must use Laravel migrations.

Core tables:
- users
- schools
- books
- book_images
- book_requests
- classrooms
- classroom_members
- notes
- note_permissions
- flashcards
- conversations
- conversation_members
- messages
- reports

Important classroom constraint:

unique:
school_id + academic_year + grade + section + track

Add indexes for:
- school_id
- seller_id
- buyer_id
- classroom_id
- status
- isbn
- grade
- subject
- created_at

When changing schema:
1. create/update migration
2. update model relationships
3. update factories/seeders if needed
4. update docs/DATABASE.md