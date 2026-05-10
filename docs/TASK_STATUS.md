# LibroSchool Task Status

This file tracks execution status for project tasks.

Status values:

- pending
- in_progress
- done
- blocked

## Core Rules

1. Only one task row may be `in_progress` at a time.
2. In normal manual mode, agents must execute only the first `pending` task unless the user explicitly specifies another task.
3. After implementation, validation must run.
4. After validation, review must run when a review task exists.
5. A task group is complete only after implementation, validation, and review companion rows are all `done`.
6. Autopilot may automatically commit completed task groups only when validation and review pass.
7. Agents must stop if a task becomes `blocked`.
8. Agents must not edit forbidden files listed in `.codebuddy/rules/08-permission-scope.md`.
9. Agents must follow `.codebuddy/rules/09-autopilot-safe-mode.md`.

## Task Table

Task IDs in this table are the execution source of truth for Autopilot.

`docs/EXECUTION_PLAN.md` uses high-level phase numbers. Those phase numbers are contextual and do not replace the task IDs below.

Rows ending in `-test` and `-review` are companion rows for the implementation task with the same base ID. In Autopilot Safe Mode, they must run automatically as part of the same task group and must not require separate user confirmation.

| Task | Name | Implementation Agent | Scope | Status | Notes |
|---|---|---|---|---|---|
| 1 | Database Foundation | backend-agent | backend-task | done | migrations, models, relationships, factories, seeders |
| 1-test | Validate Database Foundation | test-agent | test-task | done | migrate:fresh --seed and backend tests |
| 1-review | Review Database Foundation | reviewer-agent | review-task | done | review diff, scope, security |
| 2 | Auth and Schools Backend | backend-agent | backend-task | done | auth API and schools API |
| 2-test | Validate Auth and Schools Backend | test-agent | test-task | done | backend tests passed |
| 2-review | Review Auth and Schools Backend | reviewer-agent | review-task | done | added rate limiting to login/register |
| 3 | Auth and Schools Frontend | frontend-agent | frontend-task | done | login, register, dashboard, profile pages with auth hook, services, types |
| 3-test | Validate Auth and Schools Frontend | test-agent | test-task | done | lint and build passed |
| 3-review | Review Auth and Schools Frontend | reviewer-agent | review-task | done | approved with minor notes |
| 4 | Books Backend | backend-agent | backend-task | done | books API - BookController, BookPolicy, BookResource, FormRequests, 30 tests |
| 4-test | Validate Books Backend | test-agent | test-task | done | 53 tests passed (387 assertions) |
| 4-review | Review Books Backend | reviewer-agent | review-task | done | passed - no must-fix issues |
| 5 | Book Image Upload Backend | backend-agent | backend-task | done | BookImageService, UploadBookImageRequest, R2 config, 10 tests |
| 5-test | Validate Book Image Upload | test-agent | test-task | done | 63 tests passed (424 assertions) |
| 5-review | Review Book Image Upload | reviewer-agent | review-task | done | passed - no must-fix issues |
| 6 | Books Frontend | frontend-agent | frontend-task | done | /books, /books/new, /books/[id], /books/[id]/edit, BookCard, BookFilters, ImageUploader, CreateBookForm, EditBookForm |
| 6-test | Validate Books Frontend | test-agent | test-task | done | lint passed (0 errors, 4 warnings), build passed |
| 6-review | Review Books Frontend | reviewer-agent | review-task | done | passed after edit page fix |
| 7 | Book Requests Backend | backend-agent | backend-task | done | BookRequestController, BookRequestPolicy, BookRequestResource, FormRequests, 27 tests |
| 7-test | Validate Book Requests Backend | test-agent | test-task | done | 90 tests passed (578 assertions) |
| 7-review | Review Book Requests Backend | reviewer-agent | review-task | done | passed - no must-fix issues |
| 8 | Book Requests Frontend | frontend-agent | frontend-task | done | /requests, /requests/new, /requests/[id], /requests/[id]/edit, RequestCard, RequestFilters, CreateRequestForm, EditRequestForm |
| 8-test | Validate Book Requests Frontend | test-agent | test-task | done | lint passed (0 errors, 9 warnings), build passed |
| 8-review | Review Book Requests Frontend | reviewer-agent | review-task | done | passed - follows same patterns as Task 6 |
| 9A | Conversations Backend | backend-agent | backend-task | done | ConversationController, ConversationPolicy, ConversationResource, MessageResource, 20 tests |
| 9A-test | Validate Conversations Backend | test-agent | test-task | done | 110 tests passed (693 assertions) |
| 9A-review | Review Conversations Backend | reviewer-agent | review-task | done | passed - no must-fix issues |
| 9B | Conversations Frontend | frontend-agent | frontend-task | done | /messages, /messages/[id], ConversationList, MessageBubble, MessageInput |
| 9B-test | Validate Conversations Frontend | test-agent | test-task | done | lint passed (0 errors, 9 warnings), build passed |
| 9B-review | Review Conversations Frontend | reviewer-agent | review-task | done | passed - follows same patterns as Books and Requests frontend |
| 10A | Classrooms Backend | backend-agent | backend-task | done | classrooms API - ClassroomController, ClassroomPolicy, ClassroomResource, ClassroomService, 48 tests |
| 10A-test | Validate Classrooms Backend | test-agent | test-task | done | 158 tests passed (895 assertions) |
| 10A-review | Review Classrooms Backend | reviewer-agent | review-task | done | passed - no must-fix issues, 48 tests covering authorization |
| 10B | Classrooms Frontend | frontend-agent | frontend-task | done | classrooms pages, service, types, components |
| 10B-test | Validate Classrooms Frontend | test-agent | test-task | done | lint passed (0 errors), build passed |
| 10B-review | Review Classrooms Frontend | reviewer-agent | review-task | done | passed - follows patterns, API aligned, no must-fix issues |
| 11A | Notes Backend | backend-agent | backend-task | pending | notes API and visibility |
| 11A-test | Validate Notes Backend | test-agent | test-task | pending | backend tests |
| 11A-review | Review Notes Backend | reviewer-agent | review-task | pending | note visibility and security review |
| 11B | Notes Frontend | frontend-agent | frontend-task | pending | notes pages |
| 11B-test | Validate Notes Frontend | test-agent | test-task | pending | lint and build |
| 11B-review | Review Notes Frontend | reviewer-agent | review-task | pending | UI and API service review |
| 12A | Flashcards Backend | backend-agent | backend-task | pending | flashcard API |
| 12A-test | Validate Flashcards Backend | test-agent | test-task | pending | backend tests |
| 12A-review | Review Flashcards Backend | reviewer-agent | review-task | pending | flashcard authorization review |
| 12B | Flashcards Frontend | frontend-agent | frontend-task | pending | flashcard UI |
| 12B-test | Validate Flashcards Frontend | test-agent | test-task | pending | lint and build |
| 12B-review | Review Flashcards Frontend | reviewer-agent | review-task | pending | UI and API service review |
| 13A | Reports Backend | backend-agent | backend-task | pending | report API |
| 13A-test | Validate Reports Backend | test-agent | test-task | pending | backend tests |
| 13A-review | Review Reports Backend | reviewer-agent | review-task | pending | report security review |
| 13B | Reports Frontend | frontend-agent | frontend-task | pending | ReportButton and modal |
| 13B-test | Validate Reports Frontend | test-agent | test-task | pending | lint and build |
| 13B-review | Review Reports Frontend | reviewer-agent | review-task | pending | UI and API service review |
| 14A | Admin Backend | backend-agent | backend-task | pending | admin APIs |
| 14A-test | Validate Admin Backend | test-agent | test-task | pending | backend tests |
| 14A-review | Review Admin Backend | reviewer-agent | review-task | pending | admin authorization review |
| 14B | Admin Frontend | frontend-agent | frontend-task | pending | admin backoffice UI |
| 14B-test | Validate Admin Frontend | test-agent | test-task | pending | lint and build |
| 14B-review | Review Admin Frontend | reviewer-agent | review-task | pending | admin UI review |

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
2. Find the first pending implementation task group.
3. Mark the implementation row `in_progress`.
4. Execute only that implementation task using the declared agent and scope.
5. Mark the implementation row `done`, then mark the matching `*-test` row `in_progress` and validate the task.
6. Mark the `*-test` row `done`, then mark the matching `*-review` row `in_progress` and review the task if applicable.
7. If successful, mark the `*-review` row `done` so the implementation, validation, and review rows are all `done`.
8. Commit the task group using the format: `Task <task-id>: <task-name>`.
9. Continue to the next pending implementation task group without asking between implementation, validation, review, commit, and continuation.
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
