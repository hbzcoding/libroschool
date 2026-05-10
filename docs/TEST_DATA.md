# Local Test Data

This file documents the local demo data created by the Laravel seeders.

Use this data only for local development and testing.

## How to Load

From the backend directory:

```bash
php artisan migrate:fresh --seed
```

If your local database is already migrated and you only want to add or refresh demo records:

```bash
php artisan db:seed --class=DemoDataSeeder
```

The demo seeder is idempotent. Re-running it updates the same demo records instead of creating duplicates.

## Shared Password

All seeded accounts use this password:

```text
password
```

## Accounts

| Name | Email | Password | Role | School | Grade | Track | Notes |
|---|---|---|---|---|---|---|---|
| Admin User | admin@example.com | password | admin | All schools | - | - | Admin/backoffice testing |
| Test User | test@example.com | password | student | Liceo Scientifico Galileo Galilei | 5 | scientifico | Generic student account |
| Prof.ssa Laura Bianchi | teacher.roma@example.com | password | teacher | Liceo Scientifico Galileo Galilei | - | scientifico | Owner of Roma classroom |
| Prof. Marco Ferri | teacher.milano@example.com | password | teacher | Liceo Classico Giuseppe Parini | - | classico | Owner of Milano classroom |
| Alice Rossi | alice.rossi@example.com | password | student | Liceo Scientifico Galileo Galilei | 5 | scientifico | Roma classroom moderator |
| Marco Conti | marco.conti@example.com | password | student | Liceo Scientifico Galileo Galilei | 5 | scientifico | Roma classroom member |
| Giulia Romano | giulia.romano@example.com | password | student | Liceo Scientifico Galileo Galilei | 5 | scientifico | Roma classroom member |
| Luca Verdi | luca.verdi@example.com | password | student | Liceo Scientifico Galileo Galilei | 5 | scientifico | Same school, not a classroom member by default |
| Sofia Bianchi | sofia.bianchi@example.com | password | student | Liceo Classico Giuseppe Parini | 4 | classico | Milano classroom member |

## Schools

| Code | Name | City | Region | Type |
|---|---|---|---|---|
| RMIS001 | Liceo Scientifico Galileo Galilei | Roma | Lazio | lyceum |
| MIIS002 | Liceo Classico Giuseppe Parini | Milano | Lombardia | lyceum |
| NATC003 | Istituto Tecnico Industriale Fermi | Napoli | Campania | technical |
| TOIS004 | Istituto Professionale Volta | Torino | Piemonte | professional |
| FIIS005 | Liceo Scientifico Leonardo da Vinci | Firenze | Toscana | lyceum |
| BOIS006 | Istituto Tecnico Aldini Valeriani | Bologna | Emilia-Romagna | technical |

## Classrooms and Invite Codes

| Name | School | Owner | Join Code | Visibility | Members |
|---|---|---|---|---|---|
| 5A Scientifico - Matematica | Liceo Scientifico Galileo Galilei | teacher.roma@example.com | ROMA5A | public | teacher.roma@example.com, alice.rossi@example.com, marco.conti@example.com, giulia.romano@example.com, test@example.com |
| 4B Classico - Letteratura | Liceo Classico Giuseppe Parini | teacher.milano@example.com | MI4B24 | private | teacher.milano@example.com, sofia.bianchi@example.com |

Use `luca.verdi@example.com` to test joining the Roma classroom with invite code `ROMA5A`.

## Books For Sale

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

## Book Requests

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

## Notes

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

## Useful Test Flows

1. Log in as `admin@example.com` to test admin-only pages and moderation APIs.
2. Log in as `teacher.roma@example.com` to test a classroom owner account.
3. Log in as `alice.rossi@example.com` to test a classroom moderator and public note author.
4. Log in as `marco.conti@example.com` to test private notes and classroom member access.
5. Log in as `luca.verdi@example.com` and join classroom `ROMA5A` to test invite-code joining.
6. Log in as `sofia.bianchi@example.com` to test a second school and private classroom context.
7. Open `/books` to test available, reserved, and filtered book listings.
8. Open `/requests` to test open and matched book requests.
9. Open classroom `ROMA5A` to test classroom notes and flashcards.
