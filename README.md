# LibroSchool

A student book marketplace and learning resource platform for Italian high school students.

## Tech Stack

### Backend
- Laravel 12
- PHP 8.3+
- PostgreSQL
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

## Local PostgreSQL Setup (macOS Homebrew)

1. Install PostgreSQL:

   ```bash
   brew install postgresql@16
   ```

2. Add PostgreSQL to PATH.

   **Apple Silicon (M1/M2/M3/M4):**

   ```bash
   echo 'export PATH="/opt/homebrew/opt/postgresql@16/bin:$PATH"' >> ~/.zshrc
   source ~/.zshrc
   ```

   **Intel Mac:**

   ```bash
   echo 'export PATH="/usr/local/opt/postgresql@16/bin:$PATH"' >> ~/.zshrc
   source ~/.zshrc
   ```

3. Start PostgreSQL:

   ```bash
   brew services start postgresql@16
   ```

4. Create database:

   ```bash
   createdb libroschool
   ```

   If `createdb` is not found, make sure the PATH step above was applied correctly.

## How to Run Backend

1. Navigate to backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   composer install
   ```

3. Copy environment file:
   ```bash
   cp .env.example .env
   ```

4. Generate application key:
   ```bash
   php artisan key:generate
   ```

5. Run migrations:
   ```bash
   php artisan migrate
   ```

6. Start the development server:
   ```bash
   php artisan serve
   ```

The backend API will run at http://localhost:8000

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
curl http://127.0.0.1:8000/api/health
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