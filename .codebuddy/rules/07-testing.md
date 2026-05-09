---
description: Testing rules
alwaysApply: true
enabled: true
---

# Testing Rules

Backend:
- Use Laravel Feature Tests.
- Use factories.
- Test authentication.
- Test authorization.
- Test validation.
- Test CRUD behavior.

Required tests:
- user cannot edit another user's book
- user cannot close another user's request
- private note is not visible to other users
- classroom note is visible only to classroom members
- non-member cannot read messages
- invalid image upload is rejected

Frontend:
- Keep UI simple.
- Ensure TypeScript passes.
- Ensure lint/build passes when available.

Before completing a task:
- run backend tests if backend changed
- run frontend lint/build if frontend changed