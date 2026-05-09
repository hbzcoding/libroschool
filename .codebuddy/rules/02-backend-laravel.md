---
description: Laravel backend rules
alwaysApply: true
enabled: true
---

# Laravel Backend Rules

Backend is in /backend.

Use:
- Laravel
- PHP 8.3+
- PostgreSQL
- Sanctum
- Reverb when realtime is needed
- Cloudflare R2 for images

Required patterns:
- FormRequest for validation
- Policy for authorization
- Resource for API responses
- Service classes for business logic
- Eloquent relationships
- Feature tests

Controllers must be thin.

All list endpoints must be paginated.

Authorization rules:
- Book seller can update/delete own books only.
- Request owner can update/close own requests only.
- Private notes are visible only to the author.
- Classroom notes are visible only to classroom members.
- Specific-user notes are visible only to author and permitted users.
- Conversations are visible only to conversation members.

Do not trust frontend permission checks.

## Backend API Only

The Laravel backend is JSON API only.

Do not create:

* Blade public pages
* Blade user dashboard
* Blade admin panel
* Laravel-rendered backoffice UI

Admin functionality must be exposed through:

```text
/api/admin/*
```

Admin API must require:

* authentication
* admin role authorization