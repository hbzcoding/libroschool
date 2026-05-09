---
description: Security and privacy rules
alwaysApply: true
enabled: true
---

# Security Rules

This project involves minors and school-related data.

Always:
- validate input
- authorize on backend
- paginate list APIs
- restrict file uploads
- sanitize rendered user content
- protect authenticated routes
- keep secrets out of source code

Never:
- expose private notes
- expose classroom notes to non-members
- expose messages to non-members
- allow users to update other users' content
- allow unrestricted uploads
- rely only on frontend button hiding

File uploads:
- max 5MB
- allowed extensions: jpg, jpeg, png, webp
- store in Cloudflare R2

Authentication:
- use Laravel Sanctum
- protect all user APIs
- admin APIs must require admin role