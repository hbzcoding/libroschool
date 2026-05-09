# LibroSchool Task Status

This file tracks execution status for project tasks.

Status values:

- pending
- in_progress
- done
- blocked

## Core Rules

1. Only one task may be `in_progress` at a time.
2. Agents must execute only the first `pending` task unless the user explicitly specifies another task.
3. After implementation, validation must run.
4. After validation, review must run when a review task exists.
5. A task can be marked `done` only after implementation, validation, and review are complete.
6. Agents may automatically commit completed tasks only when validation and review pass.
7. Agents must stop if a task becomes `blocked`.
8. Agents must not edit forbidden files listed in `.codebuddy/rules/08-permission-scope.md`.
9. Agents must follow `.codebuddy/rules/09-autopilot-safe-mode.md`.

## Task Table

| Task | Name | Implementation Agent | Scope | Status | Notes |
|---|---|---|---|---|---|
| 1 | Database Foundation | backend-agent | backend-task | done | migrations, models, relationships, factories, seeders |
| 1-test | Validate Database Foundation | test-agent | test-task | done | migrate:fresh --seed and backend tests |
| 1-review | Review Database Foundation | reviewer-agent | review-task | done | review diff, scope, security |
| 2 | Auth and Schools Backend | backend-agent | backend-task | done | auth API and schools API |
| 2-test | Validate Auth and Schools Backend | test-agent | test-task | done | backend tests passed |
| 2-review | Review Auth and Schools Backend | reviewer-agent | review-task | done | added rate limiting to login/register |
| 3 | Auth and Schools Frontend | frontend-agent | frontend-task | pending | login, register, dashboard, profile |
| 3-test | Validate Auth and Schools Frontend | test-agent | test-task | pending | lint and build |
| 3-review | Review Auth and Schools Frontend | reviewer-agent | review-task | pending | review diff and UI/API usage |
| 4 | Books Backend | backend-agent | backend-task | pending | books API |
| 4-test | Validate Books Backend | test-agent | test-task | pending | backend tests |
| 4-review | Review Books Backend | reviewer-agent | review-task | pending | authorization and scope review |
| 5 | Book Image Upload Backend | backend-agent | backend-task | pending | Cloudflare R2 upload |
| 5-test | Validate Book Image Upload | test-agent | test-task | pending | backend tests |
| 5-review | Review Book Image Upload | reviewer-agent | review-task | pending | upload security and env review |
| 6 | Books Frontend | frontend-agent | frontend-task | pending | books list, create, detail |
| 6-test | Validate Books Frontend | test-agent | test-task | pending | lint and build |
| 6-review | Review Books Frontend | reviewer-agent | review-task | pending | UI and API service review |
| 7 | Book Requests Backend | backend-agent | backend-task | pending | book requests API |
| 7-test | Validate Book Requests Backend | test-agent | test-task | pending | backend tests |
| 7-review | Review Book Requests Backend | reviewer-agent | review-task | pending | authorization and scope review |
| 8 | Book Requests Frontend | frontend-agent | frontend-task | pending | requests list, create, detail |
| 8-test | Validate Book Requests Frontend | test-agent | test-task | pending | lint and build |
| 8-review | Review Book Requests Frontend | reviewer-agent | review-task | pending | UI and API service review |
| 9 | Conversations Backend | backend-agent | backend-task | pending | conversations and messages API |
| 9-test | Validate Conversations Backend | test-agent | test-task | pending | backend tests |
| 9-review | Review Conversations Backend | reviewer-agent | review-task | pending | conversation authorization review |
| 9b | Conversations Frontend | frontend-agent | frontend-task | pending | messages pages |
| 9b-test | Validate Conversations Frontend | test-agent | test-task | pending | lint and build |
| 9b-review | Review Conversations Frontend | reviewer-agent | review-task | pending | UI and API service review |
| 10 | Classrooms Backend | backend-agent | backend-task | pending | classrooms API |
| 10-test | Validate Classrooms Backend | test-agent | test-task | pending | backend tests |
| 10-review | Review Classrooms Backend | reviewer-agent | review-task | pending | classroom authorization review |
| 10b | Classrooms Frontend | frontend-agent | frontend-task | pending | classes pages |
| 10b-test | Validate Classrooms Frontend | test-agent | test-task | pending | lint and build |
| 10b-review | Review Classrooms Frontend | reviewer-agent | review-task | pending | UI and API service review |
| 11 | Notes Backend | backend-agent | backend-task | pending | notes API and visibility |
| 11-test | Validate Notes Backend | test-agent | test-task | pending | backend tests |
| 11-review | Review Notes Backend | reviewer-agent | review-task | note visibility and security review |
| 11b | Notes Frontend | frontend-agent | frontend-task | pending | notes pages |
| 11b-test | Validate Notes Frontend | test-agent | test-task | pending | lint and build |
| 11b-review | Review Notes Frontend | reviewer-agent | review-task | pending | UI and API service review |
| 12 | Flashcards Backend | backend-agent | backend-task | pending | flashcard API |
| 12-test | Validate Flashcards Backend | test-agent | test-task | pending | backend tests |
| 12-review | Review Flashcards Backend | reviewer-agent | review-task | pending | flashcard authorization review |
| 12b | Flashcards Frontend | frontend-agent | frontend-task | pending | flashcard UI |
| 12b-test | Validate Flashcards Frontend | test-agent | test-task | pending | lint and build |
| 12b-review | Review Flashcards Frontend | reviewer-agent | review-task | pending | UI and API service review |
| 13 | Reports Backend | backend-agent | backend-task | pending | report API |
| 13-test | Validate Reports Backend | test-agent | test-task | pending | backend tests |
| 13-review | Review Reports Backend | reviewer-agent | review-task | pending | report security review |
| 13b | Reports Frontend | frontend-agent | frontend-task | pending | ReportButton and modal |
| 13b-test | Validate Reports Frontend | test-agent | test-task | pending | lint and build |
| 13b-review | Review Reports Frontend | reviewer-agent | review-task | pending | UI and API service review |
| 14 | Admin Backend | backend-agent | backend-task | pending | admin APIs |
| 14-test | Validate Admin Backend | test-agent | test-task | pending | backend tests |
| 14-review | Review Admin Backend | reviewer-agent | review-task | pending | admin authorization review |
| 14b | Admin Frontend | frontend-agent | frontend-task | pending | admin backoffice UI |
| 14b-test | Validate Admin Frontend | test-agent | test-task | pending | lint and build |
| 14b-review | Review Admin Frontend | reviewer-agent | review-task | pending | admin UI review |

## How Autopilot Should Continue

When the user says:

```text
启用 Autopilot Safe Mode，从 docs/TASK_STATUS.md 的第一个 pending task 开始执行。
```

or:

```text
继续自动执行任务。
```

Autopilot must:

1. Read this file.
2. Find the first task with status `pending`.
3. Mark it `in_progress`.
4. Execute only that task using the declared agent and scope.
5. Validate the task.
6. Review the task if applicable.
7. If successful, mark it `done`.
8. Commit it using the format: `Task <task-id>: <task-name>`.
9. Continue to the next pending task.
10. Stop only when:
   - no pending tasks remain
   - a task becomes blocked
   - a forbidden operation is required
   - the user stops the run

## Blocked Task Notes

If a task is blocked, write a clear reason in the `Notes` column.

Example:

```text
blocked: PostgreSQL connection failed because DB_DATABASE is missing.
```
