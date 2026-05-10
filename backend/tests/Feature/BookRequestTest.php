<?php

namespace Tests\Feature;

use App\Models\BookRequest;
use App\Models\School;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BookRequestTest extends TestCase
{
    use RefreshDatabase;

    public function test_authenticated_user_can_create_book_request(): void
    {
        $user = User::factory()->create(['role' => 'student']);
        $school = School::factory()->create();
        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson('/api/book-requests', [
                'school_id' => $school->id,
                'title' => 'Matematica Verde 3',
                'isbn' => '9788800000001',
                'subject' => 'Math',
                'grade' => '3',
                'track' => 'scientific',
                'max_price' => 25.50,
                'description' => 'Looking for a good condition copy',
            ]);

        $response->assertCreated()
            ->assertJsonPath('data.title', 'Matematica Verde 3')
            ->assertJsonPath('data.status', 'open')
            ->assertJsonPath('data.buyer.id', $user->id)
            ->assertJsonPath('data.school.id', $school->id);

        $this->assertDatabaseHas('book_requests', [
            'buyer_id' => $user->id,
            'school_id' => $school->id,
            'title' => 'Matematica Verde 3',
            'status' => 'open',
        ]);
    }

    public function test_guest_cannot_create_book_request(): void
    {
        $school = School::factory()->create();

        $response = $this->postJson('/api/book-requests', [
            'school_id' => $school->id,
            'title' => 'Matematica Verde 3',
        ]);

        $response->assertUnauthorized();
    }

    public function test_user_can_list_open_book_requests(): void
    {
        BookRequest::factory()->count(20)->create(['status' => 'open']);

        $response = $this->getJson('/api/book-requests');

        $response->assertOk()
            ->assertJsonStructure([
                'data' => [
                    '*' => ['id', 'title', 'status', 'buyer', 'school'],
                ],
                'meta' => ['current_page', 'last_page', 'per_page', 'total'],
            ]);

        // Default pagination is 15
        $this->assertCount(15, $response->json('data'));
        $this->assertEquals(20, $response->json('meta.total'));
    }

    public function test_list_book_requests_default_filters_open_status(): void
    {
        BookRequest::factory()->count(10)->create(['status' => 'open']);
        BookRequest::factory()->count(5)->create(['status' => 'matched']);
        BookRequest::factory()->count(5)->create(['status' => 'closed']);
        BookRequest::factory()->count(5)->create(['status' => 'hidden']);

        $response = $this->getJson('/api/book-requests');

        $response->assertOk();
        $this->assertEquals(10, $response->json('meta.total'));
    }

    public function test_user_can_view_book_request_details(): void
    {
        $bookRequest = BookRequest::factory()->create(['status' => 'open']);

        $response = $this->getJson("/api/book-requests/{$bookRequest->id}");

        $response->assertOk()
            ->assertJsonPath('data.id', $bookRequest->id)
            ->assertJsonPath('data.title', $bookRequest->title);
    }

    public function test_user_can_filter_requests_by_school(): void
    {
        $school1 = School::factory()->create();
        $school2 = School::factory()->create();
        BookRequest::factory()->count(5)->create(['school_id' => $school1->id, 'status' => 'open']);
        BookRequest::factory()->count(3)->create(['school_id' => $school2->id, 'status' => 'open']);

        $response = $this->getJson("/api/book-requests?school_id={$school1->id}");

        $response->assertOk();
        $this->assertEquals(5, $response->json('meta.total'));
    }

    public function test_user_can_filter_requests_by_status(): void
    {
        BookRequest::factory()->count(10)->create(['status' => 'open']);
        BookRequest::factory()->count(5)->create(['status' => 'matched']);

        // Filter by matched status
        $response = $this->getJson('/api/book-requests?status=matched');

        $response->assertOk();
        $this->assertEquals(5, $response->json('meta.total'));
    }

    public function test_user_can_search_requests(): void
    {
        BookRequest::factory()->create(['title' => 'Matematica Verde', 'status' => 'open']);
        BookRequest::factory()->create(['title' => 'Storia Antica', 'status' => 'open']);
        BookRequest::factory()->create(['title' => 'Fisica Base', 'status' => 'open']);

        $response = $this->getJson('/api/book-requests?search=Matematica');

        $response->assertOk();
        $this->assertCount(1, $response->json('data'));
        $this->assertEquals('Matematica Verde', $response->json('data.0.title'));
    }

    public function test_buyer_can_update_own_request(): void
    {
        $user = User::factory()->create(['role' => 'student']);
        $bookRequest = BookRequest::factory()->create(['buyer_id' => $user->id, 'status' => 'open']);
        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->putJson("/api/book-requests/{$bookRequest->id}", [
                'title' => 'Updated Title',
                'max_price' => 30.00,
            ]);

        $response->assertOk()
            ->assertJsonPath('data.title', 'Updated Title')
            ->assertJsonPath('data.max_price', '30.00');

        $this->assertDatabaseHas('book_requests', [
            'id' => $bookRequest->id,
            'title' => 'Updated Title',
            'max_price' => 30.00,
        ]);
    }

    public function test_non_owner_cannot_update_another_users_request(): void
    {
        $owner = User::factory()->create(['role' => 'student']);
        $otherUser = User::factory()->create(['role' => 'student']);
        $bookRequest = BookRequest::factory()->create(['buyer_id' => $owner->id, 'status' => 'open']);
        $token = $otherUser->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->putJson("/api/book-requests/{$bookRequest->id}", [
                'title' => 'Updated Title',
            ]);

        $response->assertForbidden();
    }

    public function test_buyer_can_delete_own_request(): void
    {
        $user = User::factory()->create(['role' => 'student']);
        $bookRequest = BookRequest::factory()->create(['buyer_id' => $user->id, 'status' => 'open']);
        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->deleteJson("/api/book-requests/{$bookRequest->id}");

        $response->assertNoContent();

        $this->assertDatabaseMissing('book_requests', [
            'id' => $bookRequest->id,
        ]);
    }

    public function test_non_owner_cannot_delete_another_users_request(): void
    {
        $owner = User::factory()->create(['role' => 'student']);
        $otherUser = User::factory()->create(['role' => 'student']);
        $bookRequest = BookRequest::factory()->create(['buyer_id' => $owner->id, 'status' => 'open']);
        $token = $otherUser->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->deleteJson("/api/book-requests/{$bookRequest->id}");

        $response->assertForbidden();

        $this->assertDatabaseHas('book_requests', [
            'id' => $bookRequest->id,
        ]);
    }

    public function test_buyer_can_close_own_request(): void
    {
        $user = User::factory()->create(['role' => 'student']);
        $bookRequest = BookRequest::factory()->create(['buyer_id' => $user->id, 'status' => 'open']);
        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson("/api/book-requests/{$bookRequest->id}/close");

        $response->assertOk()
            ->assertJsonPath('data.status', 'closed');

        $this->assertDatabaseHas('book_requests', [
            'id' => $bookRequest->id,
            'status' => 'closed',
        ]);
    }

    public function test_non_owner_cannot_close_another_users_request(): void
    {
        $owner = User::factory()->create(['role' => 'student']);
        $otherUser = User::factory()->create(['role' => 'student']);
        $bookRequest = BookRequest::factory()->create(['buyer_id' => $owner->id, 'status' => 'open']);
        $token = $otherUser->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson("/api/book-requests/{$bookRequest->id}/close");

        $response->assertForbidden();

        $this->assertDatabaseHas('book_requests', [
            'id' => $bookRequest->id,
            'status' => 'open',
        ]);
    }

    public function test_create_book_request_validates_required_fields(): void
    {
        $user = User::factory()->create(['role' => 'student']);
        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson('/api/book-requests', []);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['school_id', 'title']);
    }

    public function test_create_book_request_validates_status_enum(): void
    {
        $user = User::factory()->create(['role' => 'student']);
        $school = School::factory()->create();
        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson('/api/book-requests', [
                'school_id' => $school->id,
                'title' => 'Test Request',
                'status' => 'invalid_status',
            ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['status']);
    }

    public function test_create_book_request_validates_max_price_range(): void
    {
        $user = User::factory()->create(['role' => 'student']);
        $school = School::factory()->create();
        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson('/api/book-requests', [
                'school_id' => $school->id,
                'title' => 'Test Request',
                'max_price' => -10.00,
            ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['max_price']);
    }

    public function test_update_book_request_validates_status_enum(): void
    {
        $user = User::factory()->create(['role' => 'student']);
        $bookRequest = BookRequest::factory()->create(['buyer_id' => $user->id, 'status' => 'open']);
        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->putJson("/api/book-requests/{$bookRequest->id}", [
                'status' => 'invalid_status',
            ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['status']);
    }

    public function test_book_requests_are_ordered_by_created_at_desc(): void
    {
        $request1 = BookRequest::factory()->create(['title' => 'Request 1', 'status' => 'open', 'created_at' => now()->subMinutes(2)]);
        $request2 = BookRequest::factory()->create(['title' => 'Request 2', 'status' => 'open', 'created_at' => now()->subMinutes(1)]);
        $request3 = BookRequest::factory()->create(['title' => 'Request 3', 'status' => 'open', 'created_at' => now()]);

        $response = $this->getJson('/api/book-requests');

        $titles = array_column($response->json('data'), 'title');
        $this->assertEquals(['Request 3', 'Request 2', 'Request 1'], $titles);
    }

    public function test_guest_can_view_book_request_list(): void
    {
        BookRequest::factory()->count(5)->create(['status' => 'open']);

        $response = $this->getJson('/api/book-requests');

        $response->assertOk();
    }

    public function test_guest_can_view_book_request_details(): void
    {
        $bookRequest = BookRequest::factory()->create(['status' => 'open']);

        $response = $this->getJson("/api/book-requests/{$bookRequest->id}");

        $response->assertOk();
    }

    public function test_book_request_resource_includes_buyer_and_school(): void
    {
        $user = User::factory()->create(['role' => 'student']);
        $school = School::factory()->create();
        $bookRequest = BookRequest::factory()->create([
            'buyer_id' => $user->id,
            'school_id' => $school->id,
            'status' => 'open',
        ]);

        $response = $this->getJson("/api/book-requests/{$bookRequest->id}");

        $response->assertOk()
            ->assertJsonStructure([
                'data' => [
                    'buyer' => ['id', 'name'],
                    'school' => ['id', 'name'],
                ],
            ]);
    }

    public function test_filter_requests_by_grade(): void
    {
        BookRequest::factory()->count(3)->create(['grade' => '1', 'status' => 'open']);
        BookRequest::factory()->count(5)->create(['grade' => '3', 'status' => 'open']);

        $response = $this->getJson('/api/book-requests?grade=3');

        $response->assertOk();
        $this->assertCount(5, $response->json('data'));
    }

    public function test_filter_requests_by_subject(): void
    {
        BookRequest::factory()->count(3)->create(['subject' => 'Math', 'status' => 'open']);
        BookRequest::factory()->count(5)->create(['subject' => 'Italian', 'status' => 'open']);

        $response = $this->getJson('/api/book-requests?subject=Math');

        $response->assertOk();
        $this->assertCount(3, $response->json('data'));
    }

    public function test_filter_requests_by_isbn(): void
    {
        BookRequest::factory()->create(['isbn' => '9788800000001', 'status' => 'open']);
        BookRequest::factory()->create(['isbn' => '9788800000002', 'status' => 'open']);
        BookRequest::factory()->create(['isbn' => '9788800000003', 'status' => 'open']);

        $response = $this->getJson('/api/book-requests?isbn=9788800000001');

        $response->assertOk();
        $this->assertCount(1, $response->json('data'));
        $this->assertEquals('9788800000001', $response->json('data.0.isbn'));
    }

    public function test_filter_requests_by_track(): void
    {
        BookRequest::factory()->count(3)->create(['track' => 'scientific', 'status' => 'open']);
        BookRequest::factory()->count(5)->create(['track' => 'classical', 'status' => 'open']);

        $response = $this->getJson('/api/book-requests?track=scientific');

        $response->assertOk();
        $this->assertCount(3, $response->json('data'));
    }

    public function test_filter_requests_by_max_price(): void
    {
        BookRequest::factory()->create(['max_price' => 10.00, 'status' => 'open']);
        BookRequest::factory()->create(['max_price' => 25.00, 'status' => 'open']);
        BookRequest::factory()->create(['max_price' => 50.00, 'status' => 'open']);

        // Filter requests with max_price <= 30
        $response = $this->getJson('/api/book-requests?max_price=30');

        $response->assertOk();
        $this->assertCount(2, $response->json('data'));
    }
}