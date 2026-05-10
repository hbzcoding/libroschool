# LibroSchool Local Runbook

This file is the quick reference for running LibroSchool locally, resetting data, and using demo accounts.

## Quick URLs

| Area | URL | Notes |
|---|---|---|
| Frontend app | http://localhost:3000 | Next.js web app |
| Login | http://localhost:3000/login | Use one of the seeded accounts below |
| Register | http://localhost:3000/register | Create a new student account |
| Dashboard | http://localhost:3000/dashboard | Authenticated user home |
| Admin backoffice UI | http://localhost:3000/admin | Frontend admin/backoffice pages |
| Backend server | http://localhost:8000 | Laravel server base URL |
| Backend API base | http://localhost:8000/api | JSON API base URL |
| Backend health check | http://127.0.0.1:8000/api/health | Quick API test |
| Backend admin API | http://localhost:8000/api/admin | Admin API prefix |

Important: the Laravel backend has no Blade admin/backoffice UI. The backoffice UI is in the Next.js frontend at `/admin`. The backend only exposes admin JSON APIs under `/api/admin/*`.

## First-Time Setup

### Backend

From the project root:

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
```

Make sure PostgreSQL is running and the local database exists:

```bash
createdb libroschool
```

Then run migrations and seed data:

```bash
php artisan migrate:fresh --seed
```

### Frontend

From the project root:

```bash
cd frontend
npm install
cp .env.example .env.local
```

The frontend env should point to the backend API:

```text
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

Using `http://127.0.0.1:8000/api` also works locally, but keep backend and frontend cookie/domain settings consistent if auth behaves oddly.

## Start Locally

Open two terminals.

Terminal 1, backend:

```bash
cd backend
php artisan serve
```

Expected backend URL:

```text
http://localhost:8000
```

Terminal 2, frontend:

```bash
cd frontend
npm run dev
```

Expected frontend URL:

```text
http://localhost:3000
```

## Reset or Refresh Data

Full local reset, deletes all local data and recreates tables:

```bash
cd backend
php artisan migrate:fresh --seed
```

Refresh only demo records without dropping the database:

```bash
cd backend
php artisan db:seed --class=DemoDataSeeder
```

The demo seeder is idempotent. Re-running it updates the same demo records instead of creating duplicates.

If routes/config/cache feel stale:

```bash
cd backend
php artisan optimize:clear
```

## Useful Checks

Backend health check:

```bash
curl http://127.0.0.1:8000/api/health
```

Backend tests:

```bash
cd backend
php artisan test
```

Frontend lint and build:

```bash
cd frontend
npm run lint
npm run build
```

## Demo Password

All seeded accounts use:

```text
password
```

## Demo Accounts

| Name | Email | Password | Role | School | Grade | Track | Use For |
|---|---|---|---|---|---|---|---|
| Admin User | admin@example.com | password | admin | All schools | - | - | Admin/backoffice testing |
| Test User | test@example.com | password | student | Liceo Scientifico Galileo Galilei | 5 | scientifico | Generic student testing |
| Prof.ssa Laura Bianchi | teacher.roma@example.com | password | teacher | Liceo Scientifico Galileo Galilei | - | scientifico | Roma classroom owner |
| Prof. Marco Ferri | teacher.milano@example.com | password | teacher | Liceo Classico Giuseppe Parini | - | classico | Milano classroom owner |
| Alice Rossi | alice.rossi@example.com | password | student | Liceo Scientifico Galileo Galilei | 5 | scientifico | Roma classroom moderator |
| Marco Conti | marco.conti@example.com | password | student | Liceo Scientifico Galileo Galilei | 5 | scientifico | Roma classroom member |
| Giulia Romano | giulia.romano@example.com | password | student | Liceo Scientifico Galileo Galilei | 5 | scientifico | Roma classroom member |
| Luca Verdi | luca.verdi@example.com | password | student | Liceo Scientifico Galileo Galilei | 5 | scientifico | Invite-code join testing |
| Sofia Bianchi | sofia.bianchi@example.com | password | student | Liceo Classico Giuseppe Parini | 4 | classico | Second school testing |

## Demo Schools

| Code | Name | City | Region | Type |
|---|---|---|---|---|
| RMIS001 | Liceo Scientifico Galileo Galilei | Roma | Lazio | lyceum |
| MIIS002 | Liceo Classico Giuseppe Parini | Milano | Lombardia | lyceum |
| NATC003 | Istituto Tecnico Industriale Fermi | Napoli | Campania | technical |
| TOIS004 | Istituto Professionale Volta | Torino | Piemonte | professional |
| FIIS005 | Liceo Scientifico Leonardo da Vinci | Firenze | Toscana | lyceum |
| BOIS006 | Istituto Tecnico Aldini Valeriani | Bologna | Emilia-Romagna | technical |

## Demo Classrooms and Invite Codes

| Classroom | School | Owner | Join Code | Visibility | Members |
|---|---|---|---|---|---|
| 5A Scientifico - Matematica | Liceo Scientifico Galileo Galilei | teacher.roma@example.com | ROMA5A | public | teacher.roma@example.com, alice.rossi@example.com, marco.conti@example.com, giulia.romano@example.com, test@example.com |
| 4B Classico - Letteratura | Liceo Classico Giuseppe Parini | teacher.milano@example.com | MI4B24 | private | teacher.milano@example.com, sofia.bianchi@example.com |

Use `luca.verdi@example.com` to test joining the Roma classroom with invite code `ROMA5A`.

## Demo Books For Sale

| Seller | Title | Subject | Grade | Price | Status |
|---|---|---|---|---|---|
| admin@example.com | Admin Demo Book - Controllo catalogo | Demo | 5 | 9.00 EUR | available |
| test@example.com | Matematica.blu 2.0 - Volume 5 | Matematica | 5 | 24.00 EUR | available |
| teacher.roma@example.com | Manuale di analisi matematica | Matematica | 5 | 18.00 EUR | available |
| teacher.milano@example.com | Letteratura italiana - Dal Barocco al Romanticismo | Letteratura italiana | 4 | 21.00 EUR | available |
| alice.rossi@example.com | Fisica - Onde e campi | Fisica | 5 | 26.50 EUR | available |
| alice.rossi@example.com | Divina Commedia - Paradiso commentato | Letteratura italiana | 5 | 12.00 EUR | reserved |
| marco.conti@example.com | Storia e storiografia - Il Novecento | Storia | 5 | 10.00 EUR | available |
| giulia.romano@example.com | Performer Heritage - Volume 2 | Inglese | 5 | 16.00 EUR | available |
| luca.verdi@example.com | Chimica concetti e modelli | Chimica | 5 | 30.00 EUR | available |
| sofia.bianchi@example.com | Greco - Versioni per il triennio | Greco | 4 | 19.00 EUR | available |

## Demo Book Requests

| Buyer | Requested Book | Subject | Grade | Max Price | Status |
|---|---|---|---|---|---|
| admin@example.com | Admin Demo Request - Controllo moderazione | Demo | 5 | 8.00 EUR | open |
| test@example.com | Fisica - Elettromagnetismo | Fisica | 5 | 22.00 EUR | open |
| teacher.roma@example.com | Eserciziario di matematica per maturita | Matematica | 5 | 15.00 EUR | open |
| teacher.milano@example.com | Antologia latina - autori imperiali | Latino | 4 | 18.00 EUR | open |
| alice.rossi@example.com | Manuale di filosofia contemporanea | Filosofia | 5 | 14.00 EUR | open |
| marco.conti@example.com | Inglese grammatica B2 | Inglese | 5 | 12.00 EUR | matched |
| giulia.romano@example.com | Biologia molecolare | Scienze | 5 | 20.00 EUR | open |
| luca.verdi@example.com | Latino base per recupero | Latino | 5 | 10.00 EUR | open |
| sofia.bianchi@example.com | Dizionario greco compatto | Greco | 4 | 25.00 EUR | open |

## Demo Notes

| Title | Author | Visibility | Subject | Grade | Access |
|---|---|---|---|---|---|
| Demo: Derivate - schema rapido | teacher.roma@example.com | classroom | Matematica | 5 | Active members of `ROMA5A` |
| Demo: Calendario verifiche 5A | teacher.roma@example.com | classroom | Matematica | 5 | Active members of `ROMA5A` |
| Demo: Promessi Sposi - capitoli chiave | alice.rossi@example.com | public | Letteratura italiana | 5 | Everyone |
| Demo: Metodo Cornell per interrogazioni | test@example.com | public | Metodo di studio | 5 | Everyone |
| Demo: Lista ripasso maturita | marco.conti@example.com | private | Storia | 5 | Marco only |
| Demo: Formulario fisica condiviso | giulia.romano@example.com | specific_users | Fisica | 5 | Giulia, Alice, Marco |
| Demo: Flashcards fisica - cinematica | giulia.romano@example.com | classroom | Fisica | 5 | Active members of `ROMA5A`; includes 3 flashcards |
| Demo: Chimica organica - gruppi funzionali | luca.verdi@example.com | public | Chimica | 5 | Everyone |
| Demo: Dante - Inferno canti I e V | teacher.milano@example.com | classroom | Letteratura italiana | 4 | Active members of `MI4B24` |
| Demo: Latino - declinazioni rapide | sofia.bianchi@example.com | public | Latino | 4 | Everyone |

## Suggested Manual Test Flows

1. Log in as `admin@example.com`, then open http://localhost:3000/admin.
2. Log in as `teacher.roma@example.com` and check owned classroom behavior.
3. Log in as `alice.rossi@example.com` and check moderator/member classroom behavior.
4. Log in as `marco.conti@example.com` and check private notes.
5. Log in as `luca.verdi@example.com`, join classroom `ROMA5A`, then check classroom note access.
6. Log in as `sofia.bianchi@example.com` and check the second school/private classroom context.
7. Open http://localhost:3000/books to test available and reserved book listings.
8. Open http://localhost:3000/requests to test open and matched book requests.
9. Open classroom `ROMA5A` to test classroom notes and flashcards.

## Admin and Backoffice Notes

Frontend admin UI:

```text
http://localhost:3000/admin
```

Admin login:

```text
admin@example.com
password
```

Backend admin API examples:

```text
GET http://localhost:8000/api/admin/users
GET http://localhost:8000/api/admin/books
GET http://localhost:8000/api/admin/book-requests
GET http://localhost:8000/api/admin/notes
GET http://localhost:8000/api/admin/classrooms
GET http://localhost:8000/api/admin/reports
GET http://localhost:8000/api/admin/schools
```

These backend URLs are API endpoints, not browser UI pages.

## Common Problems

If frontend cannot reach backend:

- Confirm backend is running on `http://localhost:8000`.
- Confirm `frontend/.env.local` has `NEXT_PUBLIC_API_URL=http://localhost:8000/api`.
- Restart `npm run dev` after changing `.env.local`.

If login/session behaves oddly:

- Keep frontend on `http://localhost:3000`.
- Keep backend `backend/.env` values aligned:

```text
SANCTUM_STATEFUL_DOMAINS=localhost:3000
FRONTEND_URL=http://localhost:3000
SESSION_DOMAIN=localhost
```

If database connection fails:

- Confirm PostgreSQL is running.
- Confirm `backend/.env` database values.
- Confirm database exists with `createdb libroschool`.

If local data looks wrong:

```bash
cd backend
php artisan migrate:fresh --seed
```
