<?php

namespace Tests\Feature;

use App\Models\Book;
use App\Models\School;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BookTest extends TestCase
{
    use RefreshDatabase;

    public function test_authenticated_user_can_create_book(): void
    {
        $user = User::factory()->create(['role' => 'student']);
        $school = School::factory()->create();
        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson('/api/books', [
                'school_id' => $school->id,
                'title' => 'Matematica Verde 3',
                'isbn' => '9788800000001',
                'subject' => 'Math',
                'grade' => '3',
                'track' => 'scientific',
                'publisher' => 'Mondadori',
                'author' => 'Mario Rossi',
                'condition' => 'good',
                'price' => 25.50,
                'description' => 'Good condition, some highlights',
            ]);

        $response->assertCreated()
            ->assertJsonPath('data.title', 'Matematica Verde 3')
            ->assertJsonPath('data.condition', 'good')
            ->assertJsonPath('data.status', 'available')
            ->assertJsonPath('data.seller.id', $user->id)
            ->assertJsonPath('data.school.id', $school->id);

        $this->assertDatabaseHas('books', [
            'seller_id' => $user->id,
            'school_id' => $school->id,
            'title' => 'Matematica Verde 3',
            'status' => 'available',
        ]);
    }

    public function test_guest_cannot_create_book(): void
    {
        $school = School::factory()->create();

        $response = $this->postJson('/api/books', [
            'school_id' => $school->id,
            'title' => 'Matematica Verde 3',
            'condition' => 'good',
            'price' => 25.50,
        ]);

        $response->assertUnauthorized();
    }

    public function test_user_can_list_available_books(): void
    {
        Book::factory()->count(20)->create(['status' => 'available']);

        $response = $this->getJson('/api/books');

        $response->assertOk()
            ->assertJsonStructure([
                'data' => [
                    '*' => ['id', 'title', 'condition', 'price', 'status', 'seller', 'school'],
                ],
                'meta' => ['current_page', 'last_page', 'per_page', 'total'],
            ]);

        // Default pagination is 15
        $this->assertCount(15, $response->json('data'));
        $this->assertEquals(20, $response->json('meta.total'));
    }

    public function test_list_books_default_filters_available_status(): void
    {
        Book::factory()->count(10)->create(['status' => 'available']);
        Book::factory()->count(5)->create(['status' => 'reserved']);
        Book::factory()->count(5)->create(['status' => 'sold']);
        Book::factory()->count(5)->create(['status' => 'hidden']);

        $response = $this->getJson('/api/books');

        $response->assertOk();
        $this->assertEquals(10, $response->json('meta.total'));
    }

    public function test_user_can_view_book_details(): void
    {
        $book = Book::factory()->create(['status' => 'available']);

        $response = $this->getJson("/api/books/{$book->id}");

        $response->assertOk()
            ->assertJsonPath('data.id', $book->id)
            ->assertJsonPath('data.title', $book->title);
    }

    public function test_user_can_filter_books_by_school(): void
    {
        $school1 = School::factory()->create();
        $school2 = School::factory()->create();
        Book::factory()->count(5)->create(['school_id' => $school1->id, 'status' => 'available']);
        Book::factory()->count(3)->create(['school_id' => $school2->id, 'status' => 'available']);

        $response = $this->getJson("/api/books?school_id={$school1->id}");

        $response->assertOk();
        $this->assertEquals(5, $response->json('meta.total'));
    }

    public function test_user_can_filter_books_by_status(): void
    {
        Book::factory()->count(10)->create(['status' => 'available']);
        Book::factory()->count(5)->create(['status' => 'reserved']);

        // Filter by reserved status
        $response = $this->getJson('/api/books?status=reserved');

        $response->assertOk();
        $this->assertEquals(5, $response->json('meta.total'));
    }

    public function test_user_can_search_books(): void
    {
        Book::factory()->create(['title' => 'Matematica Verde', 'status' => 'available']);
        Book::factory()->create(['title' => 'Storia Antica', 'status' => 'available']);
        Book::factory()->create(['title' => 'Fisica Base', 'status' => 'available']);

        $response = $this->getJson('/api/books?search=Matematica');

        $response->assertOk();
        $this->assertCount(1, $response->json('data'));
        $this->assertEquals('Matematica Verde', $response->json('data.0.title'));
    }

    public function test_user_can_filter_books_by_price_range(): void
    {
        Book::factory()->create(['price' => 10.00, 'status' => 'available']);
        Book::factory()->create(['price' => 25.00, 'status' => 'available']);
        Book::factory()->create(['price' => 50.00, 'status' => 'available']);

        $response = $this->getJson('/api/books?min_price=20&max_price=30');

        $response->assertOk();
        $this->assertCount(1, $response->json('data'));
    }

    public function test_user_can_filter_books_by_condition(): void
    {
        Book::factory()->count(3)->create(['condition' => 'new', 'status' => 'available']);
        Book::factory()->count(5)->create(['condition' => 'good', 'status' => 'available']);

        $response = $this->getJson('/api/books?condition=new');

        $response->assertOk();
        $this->assertCount(3, $response->json('data'));
    }

    public function test_seller_can_update_own_book(): void
    {
        $user = User::factory()->create(['role' => 'student']);
        $book = Book::factory()->create(['seller_id' => $user->id, 'status' => 'available']);
        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->putJson("/api/books/{$book->id}", [
                'title' => 'Updated Title',
                'price' => 30.00,
            ]);

        $response->assertOk()
            ->assertJsonPath('data.title', 'Updated Title')
            ->assertJsonPath('data.price', '30.00');

        $this->assertDatabaseHas('books', [
            'id' => $book->id,
            'title' => 'Updated Title',
            'price' => 30.00,
        ]);
    }

    public function test_non_owner_cannot_update_another_users_book(): void
    {
        $owner = User::factory()->create(['role' => 'student']);
        $otherUser = User::factory()->create(['role' => 'student']);
        $book = Book::factory()->create(['seller_id' => $owner->id, 'status' => 'available']);
        $token = $otherUser->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->putJson("/api/books/{$book->id}", [
                'title' => 'Updated Title',
            ]);

        $response->assertForbidden();
    }

    public function test_seller_can_delete_own_book(): void
    {
        $user = User::factory()->create(['role' => 'student']);
        $book = Book::factory()->create(['seller_id' => $user->id, 'status' => 'available']);
        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->deleteJson("/api/books/{$book->id}");

        $response->assertNoContent();

        $this->assertDatabaseMissing('books', [
            'id' => $book->id,
        ]);
    }

    public function test_non_owner_cannot_delete_another_users_book(): void
    {
        $owner = User::factory()->create(['role' => 'student']);
        $otherUser = User::factory()->create(['role' => 'student']);
        $book = Book::factory()->create(['seller_id' => $owner->id, 'status' => 'available']);
        $token = $otherUser->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->deleteJson("/api/books/{$book->id}");

        $response->assertForbidden();

        $this->assertDatabaseHas('books', [
            'id' => $book->id,
        ]);
    }

    public function test_seller_can_mark_own_book_as_reserved(): void
    {
        $user = User::factory()->create(['role' => 'student']);
        $book = Book::factory()->create(['seller_id' => $user->id, 'status' => 'available']);
        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson("/api/books/{$book->id}/mark-reserved");

        $response->assertOk()
            ->assertJsonPath('data.status', 'reserved');

        $this->assertDatabaseHas('books', [
            'id' => $book->id,
            'status' => 'reserved',
        ]);
    }

    public function test_non_owner_cannot_mark_another_users_book_as_reserved(): void
    {
        $owner = User::factory()->create(['role' => 'student']);
        $otherUser = User::factory()->create(['role' => 'student']);
        $book = Book::factory()->create(['seller_id' => $owner->id, 'status' => 'available']);
        $token = $otherUser->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson("/api/books/{$book->id}/mark-reserved");

        $response->assertForbidden();

        $this->assertDatabaseHas('books', [
            'id' => $book->id,
            'status' => 'available',
        ]);
    }

    public function test_seller_can_mark_own_book_as_sold(): void
    {
        $user = User::factory()->create(['role' => 'student']);
        $book = Book::factory()->create(['seller_id' => $user->id, 'status' => 'available']);
        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson("/api/books/{$book->id}/mark-sold");

        $response->assertOk()
            ->assertJsonPath('data.status', 'sold');

        $this->assertDatabaseHas('books', [
            'id' => $book->id,
            'status' => 'sold',
        ]);
    }

    public function test_non_owner_cannot_mark_another_users_book_as_sold(): void
    {
        $owner = User::factory()->create(['role' => 'student']);
        $otherUser = User::factory()->create(['role' => 'student']);
        $book = Book::factory()->create(['seller_id' => $owner->id, 'status' => 'available']);
        $token = $otherUser->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson("/api/books/{$book->id}/mark-sold");

        $response->assertForbidden();

        $this->assertDatabaseHas('books', [
            'id' => $book->id,
            'status' => 'available',
        ]);
    }

    public function test_create_book_validates_required_fields(): void
    {
        $user = User::factory()->create(['role' => 'student']);
        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson('/api/books', []);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['school_id', 'title', 'condition', 'price']);
    }

    public function test_create_book_validates_condition_enum(): void
    {
        $user = User::factory()->create(['role' => 'student']);
        $school = School::factory()->create();
        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson('/api/books', [
                'school_id' => $school->id,
                'title' => 'Test Book',
                'condition' => 'invalid_condition',
                'price' => 25.00,
            ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['condition']);
    }

    public function test_create_book_validates_price_range(): void
    {
        $user = User::factory()->create(['role' => 'student']);
        $school = School::factory()->create();
        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson('/api/books', [
                'school_id' => $school->id,
                'title' => 'Test Book',
                'condition' => 'good',
                'price' => -10.00,
            ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['price']);
    }

    public function test_update_book_validates_status_enum(): void
    {
        $user = User::factory()->create(['role' => 'student']);
        $book = Book::factory()->create(['seller_id' => $user->id, 'status' => 'available']);
        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->putJson("/api/books/{$book->id}", [
                'status' => 'invalid_status',
            ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['status']);
    }

    public function test_books_are_ordered_by_created_at_desc(): void
    {
        // Use explicit timestamps to ensure ordering
        $book1 = Book::factory()->create(['title' => 'Book 1', 'status' => 'available', 'created_at' => now()->subMinutes(2)]);
        $book2 = Book::factory()->create(['title' => 'Book 2', 'status' => 'available', 'created_at' => now()->subMinutes(1)]);
        $book3 = Book::factory()->create(['title' => 'Book 3', 'status' => 'available', 'created_at' => now()]);

        $response = $this->getJson('/api/books');

        $titles = array_column($response->json('data'), 'title');
        $this->assertEquals(['Book 3', 'Book 2', 'Book 1'], $titles);
    }

    public function test_guest_can_view_book_list(): void
    {
        Book::factory()->count(5)->create(['status' => 'available']);

        $response = $this->getJson('/api/books');

        $response->assertOk();
    }

    public function test_guest_can_view_book_details(): void
    {
        $book = Book::factory()->create(['status' => 'available']);

        $response = $this->getJson("/api/books/{$book->id}");

        $response->assertOk();
    }

    public function test_book_resource_includes_seller_and_school(): void
    {
        $user = User::factory()->create(['role' => 'student']);
        $school = School::factory()->create();
        $book = Book::factory()->create([
            'seller_id' => $user->id,
            'school_id' => $school->id,
            'status' => 'available',
        ]);

        $response = $this->getJson("/api/books/{$book->id}");

        $response->assertOk()
            ->assertJsonStructure([
                'data' => [
                    'seller' => ['id', 'name'],
                    'school' => ['id', 'name'],
                ],
            ]);
    }

    public function test_filter_books_by_grade(): void
    {
        Book::factory()->count(3)->create(['grade' => '1', 'status' => 'available']);
        Book::factory()->count(5)->create(['grade' => '3', 'status' => 'available']);

        $response = $this->getJson('/api/books?grade=3');

        $response->assertOk();
        $this->assertCount(5, $response->json('data'));
    }

    public function test_filter_books_by_subject(): void
    {
        Book::factory()->count(3)->create(['subject' => 'Math', 'status' => 'available']);
        Book::factory()->count(5)->create(['subject' => 'Italian', 'status' => 'available']);

        $response = $this->getJson('/api/books?subject=Math');

        $response->assertOk();
        $this->assertCount(3, $response->json('data'));
    }

    public function test_filter_books_by_isbn(): void
    {
        Book::factory()->create(['isbn' => '9788800000001', 'status' => 'available']);
        Book::factory()->create(['isbn' => '9788800000002', 'status' => 'available']);
        Book::factory()->create(['isbn' => '9788800000003', 'status' => 'available']);

        $response = $this->getJson('/api/books?isbn=9788800000001');

        $response->assertOk();
        $this->assertCount(1, $response->json('data'));
        $this->assertEquals('9788800000001', $response->json('data.0.isbn'));
    }

    public function test_filter_books_by_track(): void
    {
        Book::factory()->count(3)->create(['track' => 'scientific', 'status' => 'available']);
        Book::factory()->count(5)->create(['track' => 'classical', 'status' => 'available']);

        $response = $this->getJson('/api/books?track=scientific');

        $response->assertOk();
        $this->assertCount(3, $response->json('data'));
    }
}