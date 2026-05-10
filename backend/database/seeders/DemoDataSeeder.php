<?php

namespace Database\Seeders;

use App\Models\Book;
use App\Models\BookRequest;
use App\Models\Classroom;
use App\Models\ClassroomMember;
use App\Models\Flashcard;
use App\Models\Note;
use App\Models\NotePermission;
use App\Models\School;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DemoDataSeeder extends Seeder
{
    private const PASSWORD = 'password';

    public function run(): void
    {
        $this->call(SchoolSeeder::class);

        $romaSchool = School::where('code', 'RMIS001')->firstOrFail();
        $milanoSchool = School::where('code', 'MIIS002')->firstOrFail();

        $admin = $this->upsertUser('admin@example.com', [
            'name' => 'Admin User',
            'role' => 'admin',
            'school_id' => null,
            'grade' => null,
            'track' => null,
        ]);

        $testUser = $this->upsertUser('test@example.com', [
            'name' => 'Test User',
            'role' => 'student',
            'school_id' => $romaSchool->id,
            'grade' => '5',
            'track' => 'scientifico',
        ]);

        $romaTeacher = $this->upsertUser('teacher.roma@example.com', [
            'name' => 'Prof.ssa Laura Bianchi',
            'role' => 'teacher',
            'school_id' => $romaSchool->id,
            'grade' => null,
            'track' => 'scientifico',
        ]);

        $milanoTeacher = $this->upsertUser('teacher.milano@example.com', [
            'name' => 'Prof. Marco Ferri',
            'role' => 'teacher',
            'school_id' => $milanoSchool->id,
            'grade' => null,
            'track' => 'classico',
        ]);

        $alice = $this->upsertUser('alice.rossi@example.com', [
            'name' => 'Alice Rossi',
            'role' => 'student',
            'school_id' => $romaSchool->id,
            'grade' => '5',
            'track' => 'scientifico',
        ]);

        $marco = $this->upsertUser('marco.conti@example.com', [
            'name' => 'Marco Conti',
            'role' => 'student',
            'school_id' => $romaSchool->id,
            'grade' => '5',
            'track' => 'scientifico',
        ]);

        $giulia = $this->upsertUser('giulia.romano@example.com', [
            'name' => 'Giulia Romano',
            'role' => 'student',
            'school_id' => $romaSchool->id,
            'grade' => '5',
            'track' => 'scientifico',
        ]);

        $luca = $this->upsertUser('luca.verdi@example.com', [
            'name' => 'Luca Verdi',
            'role' => 'student',
            'school_id' => $romaSchool->id,
            'grade' => '5',
            'track' => 'scientifico',
        ]);

        $sofia = $this->upsertUser('sofia.bianchi@example.com', [
            'name' => 'Sofia Bianchi',
            'role' => 'student',
            'school_id' => $milanoSchool->id,
            'grade' => '4',
            'track' => 'classico',
        ]);

        $romaClassroom = Classroom::updateOrCreate(
            [
                'school_id' => $romaSchool->id,
                'academic_year' => '2025/2026',
                'grade' => '5',
                'section' => 'A',
                'track' => 'scientifico',
            ],
            [
                'owner_id' => $romaTeacher->id,
                'name' => '5A Scientifico - Matematica',
                'join_code' => 'ROMA5A',
                'join_policy' => 'code',
                'visibility' => 'public',
                'is_verified' => true,
                'status' => 'active',
            ]
        );

        $milanoClassroom = Classroom::updateOrCreate(
            [
                'school_id' => $milanoSchool->id,
                'academic_year' => '2025/2026',
                'grade' => '4',
                'section' => 'B',
                'track' => 'classico',
            ],
            [
                'owner_id' => $milanoTeacher->id,
                'name' => '4B Classico - Letteratura',
                'join_code' => 'MI4B24',
                'join_policy' => 'code',
                'visibility' => 'private',
                'is_verified' => true,
                'status' => 'active',
            ]
        );

        $this->upsertMembership($romaClassroom, $romaTeacher, 'owner');
        $this->upsertMembership($romaClassroom, $alice, 'moderator');
        $this->upsertMembership($romaClassroom, $marco, 'member');
        $this->upsertMembership($romaClassroom, $giulia, 'member');
        $this->upsertMembership($romaClassroom, $testUser, 'member');

        $this->upsertMembership($milanoClassroom, $milanoTeacher, 'owner');
        $this->upsertMembership($milanoClassroom, $sofia, 'member');

        $this->seedBooks($romaSchool, $milanoSchool, [
            $admin,
            $testUser,
            $romaTeacher,
            $milanoTeacher,
            $alice,
            $marco,
            $giulia,
            $luca,
            $sofia,
        ]);

        $this->seedBookRequests($romaSchool, $milanoSchool, [
            $admin,
            $testUser,
            $romaTeacher,
            $milanoTeacher,
            $alice,
            $marco,
            $giulia,
            $luca,
            $sofia,
        ]);

        $this->upsertNote($romaTeacher, [
            'school_id' => $romaSchool->id,
            'classroom_id' => $romaClassroom->id,
            'title' => 'Demo: Derivate - schema rapido',
            'subject' => 'Matematica',
            'grade' => '5',
            'content' => 'Regole principali: potenza, prodotto, quoziente e catena. Esercizio: calcola la derivata di f(x)=x^3+2x.',
            'visibility' => 'classroom',
            'mode' => 'normal',
        ]);

        $this->upsertNote($romaTeacher, [
            'school_id' => $romaSchool->id,
            'classroom_id' => $romaClassroom->id,
            'title' => 'Demo: Calendario verifiche 5A',
            'subject' => 'Matematica',
            'grade' => '5',
            'content' => 'Prossime verifiche: limiti venerdi, derivate martedi, simulazione orale la settimana successiva.',
            'visibility' => 'classroom',
            'mode' => 'normal',
        ]);

        $this->upsertNote($alice, [
            'school_id' => $romaSchool->id,
            'classroom_id' => null,
            'title' => 'Demo: Promessi Sposi - capitoli chiave',
            'subject' => 'Letteratura italiana',
            'grade' => '5',
            'content' => 'Riassunto breve dei capitoli principali, personaggi e temi utili per il ripasso.',
            'visibility' => 'public',
            'mode' => 'normal',
        ]);

        $this->upsertNote($testUser, [
            'school_id' => $romaSchool->id,
            'classroom_id' => null,
            'title' => 'Demo: Metodo Cornell per interrogazioni',
            'subject' => 'Metodo di studio',
            'grade' => '5',
            'content' => 'Dividi la pagina in appunti, domande e sintesi finale. Usa le domande per ripassare prima dell interrogazione.',
            'visibility' => 'public',
            'mode' => 'normal',
        ]);

        $this->upsertNote($marco, [
            'school_id' => $romaSchool->id,
            'classroom_id' => null,
            'title' => 'Demo: Lista ripasso maturita',
            'subject' => 'Storia',
            'grade' => '5',
            'content' => 'Checklist privata: Risorgimento, Prima guerra mondiale, Fascismo, Costituzione.',
            'visibility' => 'private',
            'mode' => 'normal',
        ]);

        $sharedNote = $this->upsertNote($giulia, [
            'school_id' => $romaSchool->id,
            'classroom_id' => null,
            'title' => 'Demo: Formulario fisica condiviso',
            'subject' => 'Fisica',
            'grade' => '5',
            'content' => 'Velocita, accelerazione, energia cinetica, onde e suono. Nota condivisa con Alice e Marco.',
            'visibility' => 'specific_users',
            'mode' => 'normal',
        ]);

        $this->upsertNotePermission($sharedNote, $alice);
        $this->upsertNotePermission($sharedNote, $marco);

        $flashcardNote = $this->upsertNote($giulia, [
            'school_id' => $romaSchool->id,
            'classroom_id' => $romaClassroom->id,
            'title' => 'Demo: Flashcards fisica - cinematica',
            'subject' => 'Fisica',
            'grade' => '5',
            'content' => 'Set di ripasso veloce per formule base di cinematica.',
            'visibility' => 'classroom',
            'mode' => 'flashcard',
        ]);

        $this->upsertFlashcard($flashcardNote, 'Velocita media', 'Spazio percorso diviso tempo impiegato.', 1);
        $this->upsertFlashcard($flashcardNote, 'Accelerazione media', 'Variazione di velocita divisa intervallo di tempo.', 2);
        $this->upsertFlashcard($flashcardNote, 'Moto uniformemente accelerato', 'Moto con accelerazione costante.', 3);

        $this->upsertNote($luca, [
            'school_id' => $romaSchool->id,
            'classroom_id' => null,
            'title' => 'Demo: Chimica organica - gruppi funzionali',
            'subject' => 'Chimica',
            'grade' => '5',
            'content' => 'Schema pubblico su alcoli, aldeidi, chetoni, acidi carbossilici ed esteri.',
            'visibility' => 'public',
            'mode' => 'normal',
        ]);

        $this->upsertNote($milanoTeacher, [
            'school_id' => $milanoSchool->id,
            'classroom_id' => $milanoClassroom->id,
            'title' => 'Demo: Dante - Inferno canti I e V',
            'subject' => 'Letteratura italiana',
            'grade' => '4',
            'content' => 'Punti guida per analisi del testo, figure retoriche e contesto storico-letterario.',
            'visibility' => 'classroom',
            'mode' => 'normal',
        ]);

        $this->upsertNote($sofia, [
            'school_id' => $milanoSchool->id,
            'classroom_id' => null,
            'title' => 'Demo: Latino - declinazioni rapide',
            'subject' => 'Latino',
            'grade' => '4',
            'content' => 'Tabella di ripasso con prima, seconda e terza declinazione e casi principali.',
            'visibility' => 'public',
            'mode' => 'normal',
        ]);
    }

    /**
     * @param list<User> $users
     */
    private function seedBooks(School $romaSchool, School $milanoSchool, array $users): void
    {
        $usersByEmail = $this->usersByEmail($users);

        $books = [
            'admin@example.com' => [
                [
                    'school_id' => $romaSchool->id,
                    'title' => 'Admin Demo Book - Controllo catalogo',
                    'isbn' => '9780000000001',
                    'subject' => 'Demo',
                    'grade' => '5',
                    'track' => 'scientifico',
                    'publisher' => 'LibroSchool Demo',
                    'author' => 'Demo Admin',
                    'condition' => 'very_good',
                    'price' => '9.00',
                    'description' => 'Libro creato per verificare gestione admin dei listing.',
                    'status' => 'available',
                ],
            ],
            'test@example.com' => [
                [
                    'school_id' => $romaSchool->id,
                    'title' => 'Matematica.blu 2.0 - Volume 5',
                    'isbn' => '9788808999901',
                    'subject' => 'Matematica',
                    'grade' => '5',
                    'track' => 'scientifico',
                    'publisher' => 'Zanichelli',
                    'author' => 'Bergamini, Barozzi, Trifone',
                    'condition' => 'good',
                    'price' => '24.00',
                    'description' => 'Copertina usata, interni buoni con alcune sottolineature.',
                    'status' => 'available',
                ],
            ],
            'teacher.roma@example.com' => [
                [
                    'school_id' => $romaSchool->id,
                    'title' => 'Manuale di analisi matematica',
                    'isbn' => '9788808123450',
                    'subject' => 'Matematica',
                    'grade' => '5',
                    'track' => 'scientifico',
                    'publisher' => 'Zanichelli',
                    'author' => 'Autori vari',
                    'condition' => 'very_good',
                    'price' => '18.00',
                    'description' => 'Libro di supporto per limiti, derivate e integrali.',
                    'status' => 'available',
                ],
            ],
            'teacher.milano@example.com' => [
                [
                    'school_id' => $milanoSchool->id,
                    'title' => 'Letteratura italiana - Dal Barocco al Romanticismo',
                    'isbn' => '9788839534567',
                    'subject' => 'Letteratura italiana',
                    'grade' => '4',
                    'track' => 'classico',
                    'publisher' => 'Paravia',
                    'author' => 'Baldi',
                    'condition' => 'good',
                    'price' => '21.00',
                    'description' => 'Volume con appunti a matita nei margini.',
                    'status' => 'available',
                ],
            ],
            'alice.rossi@example.com' => [
                [
                    'school_id' => $romaSchool->id,
                    'title' => 'Fisica - Onde e campi',
                    'isbn' => '9788808421129',
                    'subject' => 'Fisica',
                    'grade' => '5',
                    'track' => 'scientifico',
                    'publisher' => 'Zanichelli',
                    'author' => 'Amaldi',
                    'condition' => 'very_good',
                    'price' => '26.50',
                    'description' => 'Tenuto bene, con evidenziature leggere.',
                    'status' => 'available',
                ],
                [
                    'school_id' => $romaSchool->id,
                    'title' => 'Divina Commedia - Paradiso commentato',
                    'isbn' => '9788820137890',
                    'subject' => 'Letteratura italiana',
                    'grade' => '5',
                    'track' => 'scientifico',
                    'publisher' => 'Loescher',
                    'author' => 'Dante Alighieri',
                    'condition' => 'good',
                    'price' => '12.00',
                    'description' => 'Edizione scolastica con commenti e parafrasi.',
                    'status' => 'reserved',
                ],
            ],
            'marco.conti@example.com' => [
                [
                    'school_id' => $romaSchool->id,
                    'title' => 'Storia e storiografia - Il Novecento',
                    'isbn' => '9788842112345',
                    'subject' => 'Storia',
                    'grade' => '5',
                    'track' => 'scientifico',
                    'publisher' => 'Laterza',
                    'author' => 'Desideri',
                    'condition' => 'acceptable',
                    'price' => '10.00',
                    'description' => 'Usato, alcune pagine evidenziate, completo.',
                    'status' => 'available',
                ],
            ],
            'giulia.romano@example.com' => [
                [
                    'school_id' => $romaSchool->id,
                    'title' => 'Performer Heritage - Volume 2',
                    'isbn' => '9788808199950',
                    'subject' => 'Inglese',
                    'grade' => '5',
                    'track' => 'scientifico',
                    'publisher' => 'Zanichelli',
                    'author' => 'Spiazzi, Tavella',
                    'condition' => 'good',
                    'price' => '16.00',
                    'description' => 'Libro di letteratura inglese con appunti ordinati.',
                    'status' => 'available',
                ],
            ],
            'luca.verdi@example.com' => [
                [
                    'school_id' => $romaSchool->id,
                    'title' => 'Chimica concetti e modelli',
                    'isbn' => '9788808612343',
                    'subject' => 'Chimica',
                    'grade' => '5',
                    'track' => 'scientifico',
                    'publisher' => 'Zanichelli',
                    'author' => 'Valitutti',
                    'condition' => 'new',
                    'price' => '30.00',
                    'description' => 'Comprato nuovo, quasi mai usato.',
                    'status' => 'available',
                ],
            ],
            'sofia.bianchi@example.com' => [
                [
                    'school_id' => $milanoSchool->id,
                    'title' => 'Greco - Versioni per il triennio',
                    'isbn' => '9788858332104',
                    'subject' => 'Greco',
                    'grade' => '4',
                    'track' => 'classico',
                    'publisher' => 'Loescher',
                    'author' => 'Rossi',
                    'condition' => 'very_good',
                    'price' => '19.00',
                    'description' => 'Libro pulito, nessuna pagina mancante.',
                    'status' => 'available',
                ],
            ],
        ];

        foreach ($books as $email => $items) {
            foreach ($items as $book) {
                $this->upsertBook($usersByEmail[$email], $book);
            }
        }
    }

    /**
     * @param list<User> $users
     */
    private function seedBookRequests(School $romaSchool, School $milanoSchool, array $users): void
    {
        $usersByEmail = $this->usersByEmail($users);

        $requests = [
            'admin@example.com' => [
                [
                    'school_id' => $romaSchool->id,
                    'title' => 'Admin Demo Request - Controllo moderazione',
                    'isbn' => null,
                    'subject' => 'Demo',
                    'grade' => '5',
                    'track' => 'scientifico',
                    'max_price' => '8.00',
                    'description' => 'Richiesta creata per verificare gestione admin delle richieste.',
                    'status' => 'open',
                ],
            ],
            'test@example.com' => [
                [
                    'school_id' => $romaSchool->id,
                    'title' => 'Fisica - Elettromagnetismo',
                    'isbn' => null,
                    'subject' => 'Fisica',
                    'grade' => '5',
                    'track' => 'scientifico',
                    'max_price' => '22.00',
                    'description' => 'Cerco volume per il secondo quadrimestre, va bene anche sottolineato.',
                    'status' => 'open',
                ],
            ],
            'teacher.roma@example.com' => [
                [
                    'school_id' => $romaSchool->id,
                    'title' => 'Eserciziario di matematica per maturita',
                    'isbn' => null,
                    'subject' => 'Matematica',
                    'grade' => '5',
                    'track' => 'scientifico',
                    'max_price' => '15.00',
                    'description' => 'Cerco alcune copie per attivita di recupero.',
                    'status' => 'open',
                ],
            ],
            'teacher.milano@example.com' => [
                [
                    'school_id' => $milanoSchool->id,
                    'title' => 'Antologia latina - autori imperiali',
                    'isbn' => null,
                    'subject' => 'Latino',
                    'grade' => '4',
                    'track' => 'classico',
                    'max_price' => '18.00',
                    'description' => 'Cerco edizione recente per confronto testi.',
                    'status' => 'open',
                ],
            ],
            'alice.rossi@example.com' => [
                [
                    'school_id' => $romaSchool->id,
                    'title' => 'Manuale di filosofia contemporanea',
                    'isbn' => null,
                    'subject' => 'Filosofia',
                    'grade' => '5',
                    'track' => 'scientifico',
                    'max_price' => '14.00',
                    'description' => 'Preferibilmente in buone condizioni.',
                    'status' => 'open',
                ],
            ],
            'marco.conti@example.com' => [
                [
                    'school_id' => $romaSchool->id,
                    'title' => 'Inglese grammatica B2',
                    'isbn' => null,
                    'subject' => 'Inglese',
                    'grade' => '5',
                    'track' => 'scientifico',
                    'max_price' => '12.00',
                    'description' => 'Mi serve per ripasso certificazione.',
                    'status' => 'matched',
                ],
            ],
            'giulia.romano@example.com' => [
                [
                    'school_id' => $romaSchool->id,
                    'title' => 'Biologia molecolare',
                    'isbn' => null,
                    'subject' => 'Scienze',
                    'grade' => '5',
                    'track' => 'scientifico',
                    'max_price' => '20.00',
                    'description' => 'Cerco volume con capitolo DNA aggiornato.',
                    'status' => 'open',
                ],
            ],
            'luca.verdi@example.com' => [
                [
                    'school_id' => $romaSchool->id,
                    'title' => 'Latino base per recupero',
                    'isbn' => null,
                    'subject' => 'Latino',
                    'grade' => '5',
                    'track' => 'scientifico',
                    'max_price' => '10.00',
                    'description' => 'Cerco un manuale semplice per ripasso estivo.',
                    'status' => 'open',
                ],
            ],
            'sofia.bianchi@example.com' => [
                [
                    'school_id' => $milanoSchool->id,
                    'title' => 'Dizionario greco compatto',
                    'isbn' => null,
                    'subject' => 'Greco',
                    'grade' => '4',
                    'track' => 'classico',
                    'max_price' => '25.00',
                    'description' => 'Va bene anche edizione usata se leggibile.',
                    'status' => 'open',
                ],
            ],
        ];

        foreach ($requests as $email => $items) {
            foreach ($items as $request) {
                $this->upsertBookRequest($usersByEmail[$email], $request);
            }
        }
    }

    /**
     * @param array{name:string,role:string,school_id:int|null,grade:string|null,track:string|null} $data
     */
    private function upsertUser(string $email, array $data): User
    {
        return User::updateOrCreate(
            ['email' => $email],
            [
                'name' => $data['name'],
                'password' => Hash::make(self::PASSWORD),
                'role' => $data['role'],
                'school_id' => $data['school_id'],
                'grade' => $data['grade'],
                'track' => $data['track'],
            ]
        );
    }

    private function upsertMembership(Classroom $classroom, User $user, string $role): ClassroomMember
    {
        return ClassroomMember::updateOrCreate(
            [
                'classroom_id' => $classroom->id,
                'user_id' => $user->id,
            ],
            [
                'role' => $role,
                'status' => 'active',
            ]
        );
    }

    /**
     * @param array{school_id:int,title:string,isbn:string|null,subject:string,grade:string,track:string,publisher:string,author:string,condition:string,price:string,description:string,status:string} $data
     */
    private function upsertBook(User $seller, array $data): Book
    {
        return Book::updateOrCreate(
            [
                'seller_id' => $seller->id,
                'title' => $data['title'],
            ],
            [
                'school_id' => $data['school_id'],
                'isbn' => $data['isbn'],
                'subject' => $data['subject'],
                'grade' => $data['grade'],
                'track' => $data['track'],
                'publisher' => $data['publisher'],
                'author' => $data['author'],
                'condition' => $data['condition'],
                'price' => $data['price'],
                'description' => $data['description'],
                'status' => $data['status'],
            ]
        );
    }

    /**
     * @param array{school_id:int,title:string,isbn:string|null,subject:string,grade:string,track:string,max_price:string,description:string,status:string} $data
     */
    private function upsertBookRequest(User $buyer, array $data): BookRequest
    {
        return BookRequest::updateOrCreate(
            [
                'buyer_id' => $buyer->id,
                'title' => $data['title'],
            ],
            [
                'school_id' => $data['school_id'],
                'isbn' => $data['isbn'],
                'subject' => $data['subject'],
                'grade' => $data['grade'],
                'track' => $data['track'],
                'max_price' => $data['max_price'],
                'description' => $data['description'],
                'status' => $data['status'],
            ]
        );
    }

    /**
     * @param array{school_id:int|null,classroom_id:int|null,title:string,subject:string,grade:string,content:string,visibility:string,mode:string} $data
     */
    private function upsertNote(User $author, array $data): Note
    {
        return Note::updateOrCreate(
            [
                'author_id' => $author->id,
                'title' => $data['title'],
            ],
            [
                'school_id' => $data['school_id'],
                'classroom_id' => $data['classroom_id'],
                'subject' => $data['subject'],
                'grade' => $data['grade'],
                'content' => $data['content'],
                'visibility' => $data['visibility'],
                'mode' => $data['mode'],
            ]
        );
    }

    private function upsertFlashcard(Note $note, string $front, string $back, int $sortOrder): Flashcard
    {
        return Flashcard::updateOrCreate(
            [
                'note_id' => $note->id,
                'front' => $front,
            ],
            [
                'back' => $back,
                'sort_order' => $sortOrder,
            ]
        );
    }

    private function upsertNotePermission(Note $note, User $user): NotePermission
    {
        return NotePermission::updateOrCreate(
            [
                'note_id' => $note->id,
                'user_id' => $user->id,
            ]
        );
    }

    /**
     * @param list<User> $users
     *
     * @return array<string, User>
     */
    private function usersByEmail(array $users): array
    {
        $usersByEmail = [];

        foreach ($users as $user) {
            $usersByEmail[$user->email] = $user;
        }

        return $usersByEmail;
    }
}
