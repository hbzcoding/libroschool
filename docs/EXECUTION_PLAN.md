# LibroSchool Execution Plan

## Core Rule

The full plan is context.

The agent must only execute the currently assigned phase.

After each phase, the agent must stop and wait for human review.

## Execution Workflow

For every phase:

1. Read AGENTS.md
2. Read CODEBUDDY.md
3. Read related docs
4. Produce a short implementation plan
5. Implement only the requested phase
6. Do not start the next phase
7. Add or update tests
8. Update docs if API or database changes
9. Output changed files and test instructions
10. Stop

## Human Review Workflow

After every phase, the human should run:

```bash
git diff
```

Then run relevant tests.

For backend:

```bash
cd backend
php artisan test
```

For database:

```bash
cd backend
php artisan migrate:fresh --seed
```

For frontend:

```bash
cd frontend
npm run lint
npm run build
```

Then commit:

```bash
git add .
git commit -m "Meaningful commit message"
```

## Phase Order

### Phase 0: Documentation and Rules

Includes:
- AGENTS.md
- CODEBUDDY.md
- docs
- .codebuddy/rules

### Phase 1: Project Initialization

Includes:
- Laravel backend
- Next.js frontend
- PostgreSQL config
- Sanctum install
- health check endpoint
- basic frontend homepage

Validation:
- GET /api/health works
- frontend homepage works
- PostgreSQL connection works

### Phase 2: Database Foundation

Includes:
- migrations
- models
- relationships
- factories
- seeders

Validation:

```bash
cd backend
php artisan migrate:fresh --seed
```

### Phase 3: Auth and Schools Backend

Includes:
- register
- login
- logout
- me
- update profile
- schools API

Validation:

```bash
cd backend
php artisan test
```

### Phase 4: Auth and Schools Frontend

Includes:
- login page
- register page
- dashboard
- profile
- school selector

Validation:

```bash
cd frontend
npm run lint
npm run build
```

### Phase 5: Books Backend

Includes:
- books API
- book policy
- book filters
- mark reserved
- mark sold

### Phase 6: Book Image Upload

Includes:
- Cloudflare R2 config
- image upload
- image validation
- book_images storage

### Phase 7: Books Frontend

Includes:
- books list
- create book
- book detail
- book filters
- image uploader

### Phase 8: Book Requests Backend

Includes:
- book requests API
- request policy
- request filters
- close request

### Phase 9: Book Requests Frontend

Includes:
- request list
- create request
- request detail
- request filters

### Phase 10: Conversations

Includes:
- conversations
- messages
- contact seller
- contact buyer

### Phase 11: Classrooms

Includes:
- create classroom
- join classroom
- classroom detail
- members
- roles

### Phase 12: Notes

Includes:
- notes
- visibility rules
- note permissions
- classroom notes

### Phase 13: Flashcards

Includes:
- flashcards
- flip card UI
- previous
- next
- random

### Phase 14: Reports

Includes:
- report content
- report API
- report buttons

### Phase 15: Admin Backoffice

Includes:
- admin dashboard
- user management
- book moderation
- request moderation
- note moderation
- classroom moderation
- report management
- school management

## Forbidden During Early Phases

Do not implement:
- payment
- shipping
- mobile app
- parent portal
- official school attendance
- official grades
- official absence letters
- official digital signatures
- AI features
- complex social network
