---
description: General workflow for all AI agents
alwaysApply: true
enabled: true
---

# Agent Workflow

For every task:

1. Read AGENTS.md and CODEBUDDY.md.
2. Read relevant docs in /docs.
3. Inspect existing files before editing.
4. Make a short implementation plan.
5. Implement the smallest useful change.
6. Do not modify unrelated files.
7. Do not introduce unnecessary dependencies.
8. Update docs when API or database changes.
9. Add or update tests.
10. Summarize changed files and how to test.

Never:
- rewrite the entire project without instruction
- skip backend authorization
- hardcode secrets
- implement payment
- implement shipping
- implement mobile app
- implement parent portal
- add AI features without explicit instruction