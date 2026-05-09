---
description: Next.js frontend rules
alwaysApply: true
enabled: true
---

# Next.js Frontend Rules

Frontend is in /frontend.

Use:
- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui
- React Hook Form
- Zod

Directory structure:
- src/app for routes
- src/components for shared components
- src/features for feature modules
- src/services for API calls
- src/types for shared types
- src/lib for helpers

Do not:
- put API calls directly in page components
- hardcode API URLs everywhere
- use `any` unless unavoidable
- create complex global state too early
- over-design UI
- directly access database from frontend

UI must be:
- mobile-first
- clean
- card-based
- student-friendly
- simple