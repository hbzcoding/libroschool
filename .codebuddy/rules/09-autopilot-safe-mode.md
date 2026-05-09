---
description: Autopilot Safe Mode rules for LibroSchool task execution
alwaysApply: true
enabled: true
---

# Autopilot Safe Mode

Autopilot Safe Mode allows agents to continue executing project tasks from `docs/TASK_STATUS.md` with limited automation.

The goal is to reduce human intervention while keeping the project safe.

Autopilot may:
- execute the next pending task
- update task status
- run relevant tests
- fix small task-related errors
- commit completed tasks
- continue to the next pending task

Autopilot must not:
- bypass permission scopes
- modify forbidden files
- delete critical directories
- implement features outside the current task
- hide failures
- continue after repeated failures
- continue when product decisions are required

---

# Required Files

Autopilot must read these files before running:

```text
AGENTS.md
CODEBUDDY.md
docs/MASTER_PLAN.md
docs/EXECUTION_PLAN.md
docs/AGENT_TASKS.md
docs/TASK_STATUS.md
.codebuddy/rules/08-permission-scope.md
.codebuddy/rules/09-autopilot-safe-mode.md
```

If any required file is missing, Autopilot must stop and report the missing file.

---

# Task Selection Rule

Autopilot must use `docs/TASK_STATUS.md` as the source of truth.

When the user says:

```text
启用 Autopilot Safe Mode
```

or

```text
继续自动执行任务
```

Autopilot must:

1. Read `docs/TASK_STATUS.md`.
2. Find the first task with status `pending`.
3. Execute only that task.
4. Mark the task as `in_progress` before changing implementation files.
5. Complete the task.
6. Run the correct validation.
7. Run review if required.
8. If successful, mark the task as `done`.
9. Commit the completed task.
10. Continue to the next pending task.

---

# Task Status Values

Allowed status values:

```text
pending
in_progress
done
blocked
```

Rules:
- Only one task may be `in_progress` at a time.
- A task marked `done` must not be executed again.
- A task marked `blocked` must not be skipped silently.
- If a task is blocked, Autopilot must stop.

---

# Agent Selection Rule

Autopilot must use the agent and scope declared in `docs/TASK_STATUS.md` or `docs/AGENT_TASKS.md`.

Valid agents:
- backend-agent
- frontend-agent
- api-agent
- test-agent
- reviewer-agent
- planner-agent
- docs-agent

Valid scopes:
- docs-task
- backend-task
- frontend-task
- fullstack-task
- api-review-task
- test-task
- review-task
- planning-task

If a task does not clearly declare an agent and scope, Autopilot must stop and mark the task as `blocked`.

---

# Permission Scope Rule

Autopilot must follow `.codebuddy/rules/08-permission-scope.md`.

Agents may directly create, modify, or overwrite files inside the allowed scope.

Agents must not modify files outside the allowed scope.

If a required change is outside the current scope, Autopilot must stop and mark the task as `blocked`.

---

# Global Forbidden Files and Folders

Autopilot must never modify:

```text
.env
.env.*
.git/
node_modules/
vendor/
.codebuddy/models.json
~/.codebuddy/models.json
```

Autopilot must never commit:
- API keys
- secrets
- passwords
- tokens
- database credentials
- private configuration files

---

# Delete Rules

Autopilot may delete:
- files created during the current task if they are clearly wrong
- temporary files created during the current task
- duplicate files created during the current task

Autopilot must not delete:
- backend/ directory
- frontend/ directory
- docs/ directory
- .codebuddy/ directory
- database migration history from previous completed tasks
- files from previous completed tasks unless explicitly required by the current task
- user-created files not related to the current task

Forbidden destructive commands:

```text
rm -rf
git reset --hard
git clean -fd
dropdb
```

Exception:

```text
php artisan migrate:fresh --seed
```

is allowed only for local database validation during database or test tasks.

---

# Implementation Rule

Autopilot must execute only the current task.

It must not:
- start unrelated modules
- implement payment
- implement shipping
- implement mobile app
- implement parent portal
- implement official school attendance
- implement official grades
- implement official absence letters
- implement official digital signatures
- implement AI features
- implement complex social networking
- implement tasks not listed in `docs/TASK_STATUS.md`

---

# Validation Rule

After each implementation task, Autopilot must run the relevant validation.

Backend validation:

```bash
cd backend && php artisan test
```

Database validation:

```bash
cd backend && php artisan migrate:fresh --seed
```

Frontend validation:

```bash
cd frontend && npm run lint
cd frontend && npm run build
```

If a command is not available or cannot run in the current environment, Autopilot must report this clearly and mark the task as `blocked` unless the task can be validated another safe way.

---

# Fix Attempt Rule

If validation fails:

1. Autopilot may attempt to fix task-related issues.
2. Autopilot may retry validation.
3. Autopilot may attempt at most 2 fix cycles per task.
4. If validation still fails after 2 fix cycles, mark the task as `blocked` and stop.

Autopilot must not perform broad refactors to fix a local failure.

---

# Review Rule

If the task has a corresponding review task, Autopilot should run it after validation.

Reviewer must check:
- scope compliance
- security risks
- permission enforcement
- docs consistency
- unexpected file changes
- secrets
- tests

If reviewer reports `must-fix` issues:

1. Autopilot may attempt to fix task-related issues.
2. Autopilot may retry review.
3. Autopilot may attempt at most 2 review-fix cycles.
4. If must-fix issues remain, mark the task as `blocked` and stop.

---

# Commit Rule

Autopilot may commit automatically only when:

1. The task is complete.
2. Validation passed, or the task is docs-only and does not require code validation.
3. Review passed, if a review task exists.
4. No forbidden files were modified.
5. No secrets are present.
6. The task status has been updated to `done`.

Commit format:

```text
Task <task-id>: <task-name>
```

Examples:

```text
Task 1: Database Foundation
Task 1-test: Validate Database Foundation
Task 1-review: Review Database Foundation
```

Each task must have its own commit.

Do not combine multiple unrelated tasks into one commit.

---

# Blocking Conditions

Autopilot must stop and mark the current task as `blocked` if:

- required docs are missing
- agent or scope is unclear
- validation fails after 2 fix attempts
- review still has must-fix issues after 2 attempts
- a product decision is required
- a security decision is required
- a migration design conflict is found
- a required change is outside allowed scope
- a forbidden file must be modified
- a destructive operation is required
- environment credentials are missing
- tests cannot be run and no safe validation alternative exists

When blocked, Autopilot must write the reason in `docs/TASK_STATUS.md`.

---

# Autopilot Loop

Autopilot loop:

1. Read task status.
2. Find first pending task.
3. Mark it in_progress.
4. Execute it with declared agent and scope.
5. Validate.
6. Review if applicable.
7. Mark done.
8. Commit.
9. Move to next pending task.
10. Continue until:
   - no pending tasks remain
   - a task becomes blocked
   - a forbidden operation is required
   - the user stops the run

---

# Output After Each Task

After each task, Autopilot must output:

```text
Completed Task:
Status:
Changed files:
Validation:
Review:
Commit:
Next task:
Risks or notes:
```

---

# User Command To Start

The user can start Autopilot with:

```text
启用 Autopilot Safe Mode，从 docs/TASK_STATUS.md 的第一个 pending task 开始执行。
```

or:

```text
继续自动执行任务。
```
