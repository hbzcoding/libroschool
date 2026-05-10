# LibroSchool Execution Plan

## Core Rule

The full plan is context.

The agent must only execute the currently assigned phase or active Autopilot task group.

After each phase, the agent must stop and wait for human review in normal manual mode.

When the user explicitly starts Autopilot Safe Mode, `.codebuddy/rules/09-autopilot-safe-mode.md` overrides normal manual-mode stop rules.

## Permission Scope Rules

All tasks must declare an Agent, Scope, and Task header.

Reference: `.codebuddy/rules/08-permission-scope.md`

Agents should apply the matching permission scope automatically.

Agents must not ask for approval file-by-file when editing files inside the allowed scope.

Agents must not edit files outside the allowed scope.

Agents must not commit automatically in normal manual mode.

Autopilot Safe Mode may commit completed task groups automatically when validation and review pass.

### Required Task Header

Every task prompt should include:

```text
Agent: <agent-name>
Scope: <scope-name>
Task: <task-name>
```

Examples:

```text
Agent: backend-agent
Scope: backend-task
Task: Task 1 Database Foundation
```

```text
Agent: frontend-agent
Scope: frontend-task
Task: Task 6 Books Frontend
```

```text
Agent: docs-agent
Scope: docs-task
Task: Update API documentation
```

## Agent Workflow

For every phase in normal manual mode:

1. `planner-agent` can be used to produce a short plan if the phase is complex.
2. Implementation is done by the specified agent:
   - `backend-agent` for backend/database/API work
   - `frontend-agent` for frontend/UI work
   - `docs-agent` for docs-only work
   - `api-agent` for API contract review
3. `test-agent` validates tests, migrations, lint, and build.
4. `reviewer-agent` reviews diff, scope, security, and docs consistency.
5. Human reviews and commits.
6. No agent may start the next phase automatically.

In Autopilot Safe Mode, validation and review are companion tasks inside the active task group, and Autopilot may continue to the next pending implementation task group without asking between steps.

## Execution Workflow

For every phase in normal manual mode:

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

This workflow applies to normal manual mode. In Autopilot Safe Mode, validation, review, status updates, commit, and continuation are handled by `.codebuddy/rules/09-autopilot-safe-mode.md`.

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

Phase numbers are high-level project milestones.

Executable task IDs are defined in `docs/TASK_STATUS.md` and detailed in `docs/AGENT_TASKS.md`. For example, `Phase 2: Database Foundation` maps to `Task 1: Database Foundation`.

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

## Autopilot Safe Mode

Autopilot Safe Mode is defined in `.codebuddy/rules/09-autopilot-safe-mode.md`.

Autopilot uses `docs/TASK_STATUS.md` as the source of truth.

Autopilot can execute the first pending implementation task group, validate it, review it, mark the implementation/test/review rows done, commit the task group, and continue.

Autopilot must follow `.codebuddy/rules/08-permission-scope.md`.

Autopilot must stop if a task is blocked.

Autopilot must not modify forbidden files.

Autopilot must not perform destructive operations.

Autopilot may commit automatically only when validation and review pass.

Each implementation task group must have its own commit.
