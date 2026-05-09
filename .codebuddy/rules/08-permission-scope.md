---
description: Permission scope rules for LibroSchool agents
alwaysApply: true
enabled: true
---

# Permission Scope Rules

These rules define what each agent is allowed to modify depending on the current task scope.

Every task prompt should declare:

```text
Agent: <agent-name>
Scope: <scope-name>
Task: <task-name>
```

Example:

```text
Agent: backend-agent
Scope: backend-task
Task: Task 1 Database Foundation
```

If a task declares a scope, the agent may directly create, modify, or overwrite files inside the allowed scope without asking for approval file by file.

The agent must not modify files outside the allowed scope.

Agents must not start the next task automatically.

Agents must not commit automatically unless the user explicitly says so.

---

# Global Forbidden Files and Folders

No agent may modify these files or folders unless the user explicitly gives direct permission:

```text
.env
.env.*
.git/
node_modules/
vendor/
.codebuddy/models.json
~/.codebuddy/models.json
```

No agent may commit API keys, secrets, passwords, tokens, database credentials, or private configuration files.

No agent may run destructive commands such as:

```text
rm -rf
git reset --hard
git clean -fd
dropdb
```

Exception:

`php artisan migrate:fresh --seed` is allowed only when the task is explicitly a database validation task or test task, and only for local development.

---

# Scope: docs-task

Use this scope for:

* project documentation
* project plans
* README
* agent rules
* CodeBuddy instructions
* updating execution plans
* updating API/database/UI docs without code changes

Allowed paths:

```text
docs/
AGENTS.md
CODEBUDDY.md
README.md
.codebuddy/agents/
.codebuddy/rules/
```

Forbidden paths:

```text
backend/
frontend/
```

Allowed agents:

```text
docs-agent
planner-agent
reviewer-agent
```

Rules:

* Do not write business code.
* Do not create migrations.
* Do not create controllers.
* Do not create frontend pages.
* Do not modify backend implementation.
* Do not modify frontend implementation.

---

# Scope: backend-task

Use this scope for:

* Laravel backend code
* database migrations
* Eloquent models
* factories
* seeders
* FormRequests
* Resources
* Policies
* Services
* Controllers
* routes
* backend tests
* backend config examples
* backend API implementation
* Cloudflare R2 backend integration
* Laravel Sanctum
* Laravel Reverb later

Allowed paths:

```text
backend/
docs/API.md
docs/DATABASE.md
docs/SECURITY.md
docs/BACKEND_PLAN.md
docs/AGENT_TASKS.md
docs/EXECUTION_PLAN.md
```

Forbidden paths:

```text
frontend/
```

Allowed agents:

```text
backend-agent
test-agent
reviewer-agent
api-agent
```

Rules:

* Do not modify frontend unless explicitly instructed.
* Do not create frontend pages.
* Do not create admin UI.
* Laravel backend must remain JSON API only.
* Do not create Blade user pages.
* Do not create Blade admin pages.
* Use FormRequest for validation.
* Use Policy for authorization.
* Use Resource for API responses.
* Use Service classes for business logic when useful.
* Keep controllers thin.
* All list endpoints must be paginated.
* Important permissions must be enforced on backend.
* Add or update backend tests for important behavior.
* Do not start the next task automatically.

---

# Scope: frontend-task

Use this scope for:

* Next.js pages
* React components
* frontend services
* frontend types
* UI
* forms
* frontend routing
* frontend validation
* frontend build/lint fixes
* future admin/backoffice UI

Allowed paths:

```text
frontend/
docs/UI.md
docs/FRONTEND_PLAN.md
docs/API.md
docs/AGENT_TASKS.md
docs/EXECUTION_PLAN.md
```

Forbidden paths:

```text
backend/
```

Allowed agents:

```text
frontend-agent
test-agent
reviewer-agent
api-agent
```

Rules:

* Do not modify backend unless explicitly instructed.
* Do not directly access the database.
* Do not put API calls directly in page components.
* API calls must live in frontend/src/services.
* Shared types must live in frontend/src/types.
* Feature components should live in frontend/src/features.
* Use TypeScript.
* Use Tailwind CSS.
* Use shadcn/ui.
* Use React Hook Form and Zod for forms where appropriate.
* UI must be mobile-first, simple, clean, and card-based.
* Do not start the next task automatically.

---

# Scope: fullstack-task

Use this scope only when explicitly requested.

This scope is for tasks that intentionally require both backend and frontend changes.

Allowed paths:

```text
backend/
frontend/
docs/API.md
docs/DATABASE.md
docs/SECURITY.md
docs/UI.md
docs/BACKEND_PLAN.md
docs/FRONTEND_PLAN.md
docs/AGENT_TASKS.md
docs/EXECUTION_PLAN.md
```

Allowed agents:

```text
backend-agent
frontend-agent
api-agent
test-agent
reviewer-agent
planner-agent
```

Rules:

* Prefer not to use this scope in early phases.
* Prefer splitting backend and frontend into separate tasks.
* If used, planner-agent should create a short implementation plan first.
* Backend changes should be completed before frontend integration.
* test-agent must validate both backend and frontend.
* reviewer-agent must review scope carefully.
* Do not start the next task automatically.

---

# Scope: api-review-task

Use this scope for:

* API contract review
* route consistency checks
* request/response schema checks
* pagination consistency
* frontend/backend API alignment

Allowed paths:

```text
docs/API.md
docs/BACKEND_PLAN.md
docs/FRONTEND_PLAN.md
backend/routes/
backend/app/Http/
frontend/src/services/
frontend/src/types/
```

Allowed agents:

```text
api-agent
reviewer-agent
```

Rules:

* Review by default.
* Do not create migrations.
* Do not create frontend pages.
* Do not implement large features.
* Do not rewrite unrelated code.
* If modification is needed, propose the change first unless the user explicitly asks to apply it.

---

# Scope: test-task

Use this scope for:

* running backend tests
* running frontend lint/build
* running migration validation
* diagnosing failures
* applying small task-related fixes only

Allowed paths:

```text
backend/tests/
frontend/
backend/
docs/EXECUTION_PLAN.md
docs/AGENT_TASKS.md
```

Allowed agents:

```text
test-agent
```

Rules:

* Run or guide relevant commands.
* Fix only issues directly related to the current task.
* Do not implement new modules.
* Do not start the next task.
* Do not perform broad refactors.
* If a fix requires a design decision, stop and ask the user.
* Do not commit automatically.

Validation commands:

Backend:

```bash
cd backend && php artisan test
```

Database:

```bash
cd backend && php artisan migrate:fresh --seed
```

Frontend:

```bash
cd frontend && npm run lint
cd frontend && npm run build
```

---

# Scope: review-task

Use this scope for:

* reviewing git diff
* checking task scope
* checking security
* checking authorization
* checking docs consistency
* checking whether unrelated files were modified

Allowed paths:

```text
read-only by default
docs/
```

Allowed agents:

```text
reviewer-agent
```

Rules:

* Review by default.
* Do not implement new features.
* Do not make broad edits.
* Do not start the next task.
* Output must-fix issues separately from optional improvements.
* If asked to fix something, only apply minimal fixes.

Review checklist:

```text
1. Did the agent modify only allowed paths?
2. Did the agent start the next phase accidentally?
3. Are permissions enforced on backend?
4. Are validation rules present?
5. Are list endpoints paginated?
6. Are secrets committed?
7. Are .env files ignored?
8. Are docs updated if API/database changed?
9. Are tests present for important behavior?
```

---

# Scope: planning-task

Use this scope for:

* breaking a large task into smaller tasks
* deciding which agent should execute each task
* identifying dependencies
* identifying risks
* creating implementation plans

Allowed paths:

```text
docs/
AGENTS.md
CODEBUDDY.md
.codebuddy/rules/
```

Allowed agents:

```text
planner-agent
docs-agent
```

Rules:

* Do not write business code.
* Do not create migrations.
* Do not create frontend pages.
* Do not implement features.
* Produce a clear execution plan.
* Stop after planning.

---

# Required Task Header

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
Task: Task 7 Books Frontend
```

```text
Agent: reviewer-agent
Scope: review-task
Task: Review Task 1 Diff
```

---

# Commit Rule

Agents must not commit automatically.

They may suggest a commit message.

Only the human user commits unless the user explicitly says:

```text
You may commit this change.
```
