# LibroSchool PRD

## Product Name

LibroSchool

## One-Line Description

LibroSchool is a web-first platform for Italian high school students to sell used school books, post book requests, share notes, join classroom rooms, and study with flashcards.

## Product Positioning

LibroSchool starts as a school book marketplace and gradually becomes a student learning resource platform.

Books are the acquisition channel.
Notes, classrooms, and flashcards are the retention features.

## Target Users

Primary users:
- Italian high school students
- students who want to sell used books
- students who want to buy cheaper used books
- students who want to post book requests
- students who want to share or find notes

Secondary users:
- class representatives
- teachers
- future school partners

Not target users for MVP:
- parents
- school administrators
- official school systems

## Core Problem

Italian high school books are expensive.

Existing buyback or resale services may give sellers a low percentage of the book value.

Students already trade books informally through WhatsApp, Telegram, Instagram, and offline networks, but the information is scattered, hard to search, and not organized by school, grade, subject, or ISBN.

## Core Value

LibroSchool helps students:
- sell directly to other students
- buy books from students in the same school
- post book requests
- search by school, grade, subject, track, and ISBN
- organize class resources
- share notes
- study with flashcards

## MVP Strategy

LibroSchool should not build the full product in one step.

The first release must validate whether students will use a school-based platform to buy and sell books directly.

The product is divided into four MVP layers.

## MVP 1: Book Marketplace

MVP 1 includes:
1. User registration and login
2. Basic user profile
3. School search and selection
4. Book selling listings
5. Book requests
6. Book search and filters
7. Request search and filters
8. Simple conversations between buyers and sellers

MVP 1 does not include:
- classrooms
- notes
- flashcards
- reports
- admin backoffice
- payment
- shipping
- mobile app
- parent portal
- official school systems
- AI features
- complex social networking

## MVP 2: Classrooms

MVP 2 includes:
1. User-generated classroom rooms
2. Classroom join code
3. Classroom membership
4. Classroom books
5. Classroom requests
6. Basic classroom resources

## MVP 3: Notes and Flashcards

MVP 3 includes:
1. Notes
2. Note visibility
3. Classroom notes
4. Flashcards
5. Flashcard study UI

## MVP 4: Reports and Admin

MVP 4 includes:
1. Report system
2. Admin dashboard
3. User moderation
4. Book moderation
5. Request moderation
6. Note moderation
7. Classroom moderation
8. School management

## Full Product Scope

The full product vision includes:

1. User registration and login
2. User profile with school, grade, and track
3. School search and selection
4. Book selling listings
5. Book requests
6. Book search and filters
7. Request search and filters
8. Simple conversations between buyers and sellers
9. User-generated classroom rooms
10. Classroom join code
11. Notes
12. Flashcards
13. Reports
14. Basic admin tools
15. Image upload to Cloudflare R2

## Out of Scope

Do not build:

- payment
- shipping
- mobile app in the first web MVP
- parent portal
- official school attendance
- official grades
- official absence letters
- official school signatures
- AI features in the first MVP
- complex recommendation system
- complex social networking
- full LMS system

## Main User Flows

### Sell Book Flow

1. User logs in.
2. User opens "Sell Book".
3. User enters title, ISBN, subject, grade, condition, price, and description.
4. User uploads images.
5. User publishes the book.
6. Other students discover the book.
7. Interested buyer starts a conversation.
8. Seller marks the book as reserved or sold.

### Book Request Flow

1. User logs in.
2. User opens "Request Book".
3. User enters title, ISBN, subject, grade, max price, and description.
4. User publishes the request.
5. Sellers see the request.
6. Seller contacts buyer.
7. Buyer closes the request when solved.

### Classroom Flow

1. User logs in.
2. User creates a classroom by selecting school, academic year, grade, section, and track.
3. System generates class name and join code.
4. Other students join using the code.
5. Members can view classroom books, requests, and notes.

### Note Flow

1. User creates a note.
2. User chooses visibility:
   - public
   - private
   - classroom
   - specific users
3. User writes normal note content or creates flashcards.
4. Authorized users can view it.

## Success Metrics

MVP 1 success metrics:
- number of registered users
- number of active schools
- number of book listings
- number of book requests
- number of conversations started
- number of completed or marked sold listings
- number of returning users

Full product success metrics:
- number of classroom rooms
- number of notes created
- number of flashcards created
- number of reports handled
- number of admin moderation actions

## Product Principle

Keep the product simple.

The first goal is to help students save money and find books.

Do not build heavy school-management features until the student marketplace and learning resource platform are validated.
