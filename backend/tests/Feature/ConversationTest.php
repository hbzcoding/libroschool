<?php

namespace Tests\Feature;

use App\Models\Book;
use App\Models\BookRequest;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\School;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ConversationTest extends TestCase
{
    use RefreshDatabase;

    public function test_authenticated_user_can_create_conversation_with_book_context(): void
    {
        $user = User::factory()->create(['role' => 'student']);
        $recipient = User::factory()->create(['role' => 'student']);
        $book = Book::factory()->create(['status' => 'available']);
        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson('/api/conversations', [
                'recipient_id' => $recipient->id,
                'book_id' => $book->id,
            ]);

        $response->assertCreated()
            ->assertJsonPath('data.book.id', $book->id)
            ->assertJsonStructure([
                'data' => [
                    'id',
                    'book',
                    'members',
                    'created_at',
                ],
            ]);

        $this->assertDatabaseHas('conversations', [
            'book_id' => $book->id,
        ]);

        $conversation = Conversation::first();
        $this->assertDatabaseHas('conversation_members', [
            'conversation_id' => $conversation->id,
            'user_id' => $user->id,
        ]);
        $this->assertDatabaseHas('conversation_members', [
            'conversation_id' => $conversation->id,
            'user_id' => $recipient->id,
        ]);
    }

    public function test_authenticated_user_can_create_conversation_with_book_request_context(): void
    {
        $user = User::factory()->create(['role' => 'student']);
        $recipient = User::factory()->create(['role' => 'student']);
        $school = School::factory()->create();
        $bookRequest = BookRequest::factory()->create(['school_id' => $school->id]);
        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson('/api/conversations', [
                'recipient_id' => $recipient->id,
                'book_request_id' => $bookRequest->id,
            ]);

        $response->assertCreated()
            ->assertJsonPath('data.book_request.id', $bookRequest->id);

        $this->assertDatabaseHas('conversations', [
            'book_request_id' => $bookRequest->id,
        ]);
    }

    public function test_unauthenticated_user_cannot_create_conversation(): void
    {
        $recipient = User::factory()->create(['role' => 'student']);
        $book = Book::factory()->create(['status' => 'available']);

        $response = $this->postJson('/api/conversations', [
            'recipient_id' => $recipient->id,
            'book_id' => $book->id,
        ]);

        $response->assertUnauthorized();
    }

    public function test_duplicate_conversation_not_created_for_same_users_and_book(): void
    {
        $user = User::factory()->create(['role' => 'student']);
        $recipient = User::factory()->create(['role' => 'student']);
        $book = Book::factory()->create(['status' => 'available']);
        $token = $user->createToken('test-token')->plainTextToken;

        // Create first conversation
        $response1 = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson('/api/conversations', [
                'recipient_id' => $recipient->id,
                'book_id' => $book->id,
            ]);

        $response1->assertCreated();
        $conversationId = $response1->json('data.id');

        // Try to create duplicate conversation
        $response2 = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson('/api/conversations', [
                'recipient_id' => $recipient->id,
                'book_id' => $book->id,
            ]);

        // Should return existing conversation, not create new one
        $response2->assertOk()
            ->assertJsonPath('data.id', $conversationId);

        // Only one conversation should exist
        $this->assertEquals(1, Conversation::count());
    }

    public function test_user_cannot_create_conversation_with_self(): void
    {
        $user = User::factory()->create(['role' => 'student']);
        $book = Book::factory()->create(['status' => 'available']);
        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson('/api/conversations', [
                'recipient_id' => $user->id,
                'book_id' => $book->id,
            ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['recipient_id']);
    }

    public function test_user_can_list_own_conversations(): void
    {
        $user = User::factory()->create(['role' => 'student']);
        $otherUser = User::factory()->create(['role' => 'student']);

        // Create conversations where user is a member
        for ($i = 0; $i < 3; $i++) {
            $recipient = User::factory()->create(['role' => 'student']);
            $conversation = Conversation::factory()->create();
            $conversation->members()->createMany([
                ['user_id' => $user->id],
                ['user_id' => $recipient->id],
            ]);
        }

        // Create a conversation where user is NOT a member
        $conversationNotMember = Conversation::factory()->create();
        $conversationNotMember->members()->createMany([
            ['user_id' => $otherUser->id],
            ['user_id' => User::factory()->create(['role' => 'student'])->id],
        ]);

        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/conversations');

        $response->assertOk()
            ->assertJsonStructure([
                'data' => [
                    '*' => ['id', 'created_at'],
                ],
                'meta' => ['current_page', 'last_page', 'per_page', 'total'],
            ]);

        // Should only see conversations where user is a member
        $this->assertEquals(3, $response->json('meta.total'));
    }

    public function test_user_can_view_conversation_details(): void
    {
        $user = User::factory()->create(['role' => 'student']);
        $recipient = User::factory()->create(['role' => 'student']);
        $conversation = Conversation::factory()->create();
        $conversation->members()->createMany([
            ['user_id' => $user->id],
            ['user_id' => $recipient->id],
        ]);
        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson("/api/conversations/{$conversation->id}");

        $response->assertOk()
            ->assertJsonPath('data.id', $conversation->id);
    }

    public function test_non_member_cannot_view_conversation(): void
    {
        $user = User::factory()->create(['role' => 'student']);
        $member1 = User::factory()->create(['role' => 'student']);
        $member2 = User::factory()->create(['role' => 'student']);
        $conversation = Conversation::factory()->create();
        $conversation->members()->createMany([
            ['user_id' => $member1->id],
            ['user_id' => $member2->id],
        ]);
        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson("/api/conversations/{$conversation->id}");

        $response->assertForbidden();
    }

    public function test_conversation_member_can_view_messages(): void
    {
        $user = User::factory()->create(['role' => 'student']);
        $recipient = User::factory()->create(['role' => 'student']);
        $conversation = Conversation::factory()->create();
        $conversation->members()->createMany([
            ['user_id' => $user->id],
            ['user_id' => $recipient->id],
        ]);

        // Create some messages
        Message::factory()->count(10)->create([
            'conversation_id' => $conversation->id,
        ]);

        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson("/api/conversations/{$conversation->id}/messages");

        $response->assertOk()
            ->assertJsonStructure([
                'data' => [
                    '*' => ['id', 'sender', 'body', 'created_at'],
                ],
                'meta' => ['current_page', 'last_page', 'per_page', 'total'],
            ]);

        // Pagination is 15, we have 10 messages
        $this->assertEquals(10, $response->json('meta.total'));
    }

    public function test_non_member_cannot_view_messages(): void
    {
        $user = User::factory()->create(['role' => 'student']);
        $member1 = User::factory()->create(['role' => 'student']);
        $member2 = User::factory()->create(['role' => 'student']);
        $conversation = Conversation::factory()->create();
        $conversation->members()->createMany([
            ['user_id' => $member1->id],
            ['user_id' => $member2->id],
        ]);
        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson("/api/conversations/{$conversation->id}/messages");

        $response->assertForbidden();
    }

    public function test_conversation_member_can_send_message(): void
    {
        $user = User::factory()->create(['role' => 'student']);
        $recipient = User::factory()->create(['role' => 'student']);
        $conversation = Conversation::factory()->create();
        $conversation->members()->createMany([
            ['user_id' => $user->id],
            ['user_id' => $recipient->id],
        ]);
        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson("/api/conversations/{$conversation->id}/messages", [
                'body' => 'Hello, I want to buy your book.',
            ]);

        $response->assertCreated()
            ->assertJsonPath('data.body', 'Hello, I want to buy your book.')
            ->assertJsonPath('data.sender.id', $user->id);

        $this->assertDatabaseHas('messages', [
            'conversation_id' => $conversation->id,
            'sender_id' => $user->id,
            'body' => 'Hello, I want to buy your book.',
        ]);
    }

    public function test_non_member_cannot_send_message(): void
    {
        $user = User::factory()->create(['role' => 'student']);
        $member1 = User::factory()->create(['role' => 'student']);
        $member2 = User::factory()->create(['role' => 'student']);
        $conversation = Conversation::factory()->create();
        $conversation->members()->createMany([
            ['user_id' => $member1->id],
            ['user_id' => $member2->id],
        ]);
        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson("/api/conversations/{$conversation->id}/messages", [
                'body' => 'Hello',
            ]);

        $response->assertForbidden();
    }

    public function test_message_body_is_required(): void
    {
        $user = User::factory()->create(['role' => 'student']);
        $recipient = User::factory()->create(['role' => 'student']);
        $conversation = Conversation::factory()->create();
        $conversation->members()->createMany([
            ['user_id' => $user->id],
            ['user_id' => $recipient->id],
        ]);
        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson("/api/conversations/{$conversation->id}/messages", [
                'body' => '',
            ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['body']);
    }

    public function test_conversation_creation_requires_context(): void
    {
        $user = User::factory()->create(['role' => 'student']);
        $recipient = User::factory()->create(['role' => 'student']);
        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson('/api/conversations', [
                'recipient_id' => $recipient->id,
            ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['book_id']);
    }

    public function test_conversation_creation_validates_recipient_exists(): void
    {
        $user = User::factory()->create(['role' => 'student']);
        $book = Book::factory()->create(['status' => 'available']);
        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson('/api/conversations', [
                'recipient_id' => 99999,
                'book_id' => $book->id,
            ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['recipient_id']);
    }

    public function test_conversations_are_ordered_by_updated_at_desc(): void
    {
        $user = User::factory()->create(['role' => 'student']);
        $token = $user->createToken('test-token')->plainTextToken;

        // Create conversations with different timestamps
        $conversation1 = Conversation::factory()->create(['updated_at' => now()->subMinutes(2)]);
        $conversation1->members()->create(['user_id' => $user->id]);

        $conversation2 = Conversation::factory()->create(['updated_at' => now()->subMinutes(1)]);
        $conversation2->members()->create(['user_id' => $user->id]);

        $conversation3 = Conversation::factory()->create(['updated_at' => now()]);
        $conversation3->members()->create(['user_id' => $user->id]);

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/conversations');

        $ids = array_column($response->json('data'), 'id');
        $this->assertEquals([$conversation3->id, $conversation2->id, $conversation1->id], $ids);
    }

    public function test_messages_are_ordered_by_created_at_asc(): void
    {
        $user = User::factory()->create(['role' => 'student']);
        $recipient = User::factory()->create(['role' => 'student']);
        $conversation = Conversation::factory()->create();
        $conversation->members()->createMany([
            ['user_id' => $user->id],
            ['user_id' => $recipient->id],
        ]);
        $token = $user->createToken('test-token')->plainTextToken;

        // Create messages with different timestamps
        $message1 = Message::factory()->create([
            'conversation_id' => $conversation->id,
            'created_at' => now()->subMinutes(2),
        ]);
        $message2 = Message::factory()->create([
            'conversation_id' => $conversation->id,
            'created_at' => now()->subMinutes(1),
        ]);
        $message3 = Message::factory()->create([
            'conversation_id' => $conversation->id,
            'created_at' => now(),
        ]);

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson("/api/conversations/{$conversation->id}/messages");

        $ids = array_column($response->json('data'), 'id');
        $this->assertEquals([$message1->id, $message2->id, $message3->id], $ids);
    }

    public function test_conversation_updated_at_is_updated_on_new_message(): void
    {
        $user = User::factory()->create(['role' => 'student']);
        $recipient = User::factory()->create(['role' => 'student']);
        $conversation = Conversation::factory()->create(['updated_at' => now()->subHour()]);
        $conversation->members()->createMany([
            ['user_id' => $user->id],
            ['user_id' => $recipient->id],
        ]);
        $token = $user->createToken('test-token')->plainTextToken;

        $originalUpdatedAt = $conversation->updated_at;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson("/api/conversations/{$conversation->id}/messages", [
                'body' => 'New message',
            ]);

        $response->assertCreated();

        $conversation->refresh();
        $this->assertTrue($conversation->updated_at->greaterThan($originalUpdatedAt));
    }

    public function test_conversation_pagination_is_15_per_page(): void
    {
        $user = User::factory()->create(['role' => 'student']);
        $token = $user->createToken('test-token')->plainTextToken;

        // Create 20 conversations
        for ($i = 0; $i < 20; $i++) {
            $recipient = User::factory()->create(['role' => 'student']);
            $conversation = Conversation::factory()->create();
            $conversation->members()->createMany([
                ['user_id' => $user->id],
                ['user_id' => $recipient->id],
            ]);
        }

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/conversations');

        $response->assertOk();
        $this->assertCount(15, $response->json('data'));
        $this->assertEquals(20, $response->json('meta.total'));
        $this->assertEquals(15, $response->json('meta.per_page'));
    }

    public function test_messages_pagination_is_15_per_page(): void
    {
        $user = User::factory()->create(['role' => 'student']);
        $recipient = User::factory()->create(['role' => 'student']);
        $conversation = Conversation::factory()->create();
        $conversation->members()->createMany([
            ['user_id' => $user->id],
            ['user_id' => $recipient->id],
        ]);
        $token = $user->createToken('test-token')->plainTextToken;

        // Create 20 messages
        Message::factory()->count(20)->create([
            'conversation_id' => $conversation->id,
        ]);

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson("/api/conversations/{$conversation->id}/messages");

        $response->assertOk();
        $this->assertCount(15, $response->json('data'));
        $this->assertEquals(20, $response->json('meta.total'));
        $this->assertEquals(15, $response->json('meta.per_page'));
    }
}