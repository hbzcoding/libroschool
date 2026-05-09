# LibroSchool

A student book marketplace and learning resource platform for Italian high school students.

## Tech Stack

### Backend
- Laravel 12
- PHP 8.3+
- SQLite (default for development, PostgreSQL for production)
- Laravel Sanctum

### Frontend
- Next.js
- TypeScript
- Tailwind CSS
- shadcn/ui

## Architecture

- `backend/` - Laravel JSON API only (no Blade UI)
- `frontend/` - Next.js web application
- Admin/backoffice UI will be implemented in `frontend/src/app/admin` in future phases (not in this initialization)

## Project Structure

```
LibroSchool/
├── backend/          # Laravel API
├── frontend/         # Next.js frontend
├── docs/             # Documentation
├── AGENTS.md         # Agent instructions
├── CODEBUDDY.md      # CodeBuddy context
└── .codebuddy/       # CodeBuddy rules
```

## How to Run Backend

1. Navigate to backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   composer install
   ```

3. Copy environment file (if needed):
   ```bash
   cp .env.example .env
   ```

4. Generate application key:
   ```bash
   php artisan key:generate
   ```

5. Create SQLite database file:
   ```bash
   touch database/database.sqlite
   ```

6. Run migrations:
   ```bash
   php artisan migrate
   ```

7. Start the development server:
   ```bash
   php artisan serve
   ```

The backend API will run at http://localhost:8000

**Note:** The default configuration uses SQLite for simplicity during development. You can switch to PostgreSQL later by updating the `.env` file.

## How to Run Frontend

1. Navigate to frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy environment file:
   ```bash
   cp .env.example .env.local
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

The frontend will run at http://localhost:3000

## How to Test Health Check

Once the backend is running, you can test the health check endpoint:

```bash
curl http://localhost:8000/api/health
```

Expected response:
```json
{
  "status": "ok",
  "service": "libroschool-api"
}
```

## Current Status

**Project initialization only, no business features yet.**

The following modules are NOT implemented:
- Books
- Book Requests
- Notes
- Classrooms
- Messages
- Payment
- Shipping
- Mobile App
- Parent Portal
- AI Features
- Admin/Backoffice UI

See docs/ROADMAP.md for the planned development phases.