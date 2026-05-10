<?php

namespace Tests\Feature;

use App\Models\Classroom;
use App\Models\ClassroomMember;
use App\Models\Flashcard;
use App\Models\Note;
use App\Models\NotePermission;
use App\Models\School;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class FlashcardTest extends TestCase
{
    use RefreshDatabase;

    // ========================================
    // Flashcard Creation Tests
    // ========================================

    public function test_note_author_can_create_flashcard(): void
    {
        $user = User::factory()->create();
        $note = Note::factory()->create([
            'author_id' => $user->id,
            'visibility' => 'public',
        ]);
        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson("/api/notes/{$note->id}/flashcards", [
                'front_text' => 'What is gravity?',
                'back_text' => 'A force that attracts objects toward the center of the Earth.',
            ]);

        $response->assertCreated()
            ->assertJsonPath('data.front_text', 'What is gravity?')
            ->assertJsonPath('data.back_text', 'A force that attracts objects toward the center of the Earth.')
            ->assertJsonPath('data.note_id', $note->id)
            ->assertJsonPath('data.position', 0);

        $this->assertDatabaseHas('flashcards', [
            'note_id' => $note->id,
            'front' => 'What is gravity?',
            'back' => 'A force that attracts objects toward the center of the Earth.',
        ]);
    }

    public function test_note_author_can_create_flashcard_with_position(): void
    {
        $user = User::factory()->create();
        $note = Note::factory()->create([
            'author_id' => $user->id,
            'visibility' => 'public',
        ]);
        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson("/api/notes/{$note->id}/flashcards", [
                'front_text' => 'Question 3',
                'back_text' => 'Answer 3',
                'position' => 2,
            ]);

        $response->assertCreated()
            ->assertJsonPath('data.position', 2);
    }

    public function test_non_author_cannot_create_flashcard(): void
    {
        $author = User::factory()->create();
        $otherUser = User::factory()->create();
        $note = Note::factory()->create([
            'author_id' => $author->id,
            'visibility' => 'public',
        ]);
        $token = $otherUser->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson("/api/notes/{$note->id}/flashcards", [
                'front_text' => 'Front',
                'back_text' => 'Back',
            ]);

        $response->assertForbidden();
    }

    public function test_guest_cannot_create_flashcard(): void
    {
        $author = User::factory()->create();
        $note = Note::factory()->create([
            'author_id' => $author->id,
            'visibility' => 'public',
        ]);

        $response = $this->postJson("/api/notes/{$note->id}/flashcards", [
            'front_text' => 'Front',
            'back_text' => 'Back',
        ]);

        $response->assertUnauthorized();
    }

    public function test_create_flashcard_validates_required_fields(): void
    {
        $user = User::factory()->create();
        $note = Note::factory()->create([
            'author_id' => $user->id,
            'visibility' => 'public',
        ]);
        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson("/api/notes/{$note->id}/flashcards", []);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['front_text', 'back_text']);
    }

    public function test_create_flashcard_validates_max_length(): void
    {
        $user = User::factory()->create();
        $note = Note::factory()->create([
            'author_id' => $user->id,
            'visibility' => 'public',
        ]);
        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson("/api/notes/{$note->id}/flashcards", [
                'front_text' => str_repeat('a', 1001),
                'back_text' => str_repeat('b', 1001),
            ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['front_text', 'back_text']);
    }

    // ========================================
    // Flashcard List Tests
    // ========================================

    public function test_author_can_list_own_flashcards(): void
    {
        $user = User::factory()->create();
        $note = Note::factory()->create([
            'author_id' => $user->id,
            'visibility' => 'private',
        ]);
        Flashcard::factory()->count(3)->forNote($note)->create();
        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson("/api/notes/{$note->id}/flashcards");

        $response->assertOk()
            ->assertJsonStructure([
                'data' => [
                    '*' => ['id', 'note_id', 'front_text', 'back_text', 'position', 'created_at', 'updated_at'],
                ],
                'meta' => ['current_page', 'last_page', 'per_page', 'total'],
            ]);

        $this->assertCount(3, $response->json('data'));
    }

    public function test_user_can_list_flashcards_for_public_note(): void
    {
        $author = User::factory()->create();
        $user = User::factory()->create();
        $note = Note::factory()->create([
            'author_id' => $author->id,
            'visibility' => 'public',
        ]);
        Flashcard::factory()->count(3)->forNote($note)->create();
        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson("/api/notes/{$note->id}/flashcards");

        $response->assertOk();
        $this->assertCount(3, $response->json('data'));
    }

    public function test_user_cannot_list_flashcards_for_private_note_they_dont_own(): void
    {
        $author = User::factory()->create();
        $otherUser = User::factory()->create();
        $note = Note::factory()->create([
            'author_id' => $author->id,
            'visibility' => 'private',
        ]);
        Flashcard::factory()->count(3)->forNote($note)->create();
        $token = $otherUser->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson("/api/notes/{$note->id}/flashcards");

        $response->assertForbidden();
    }

    public function test_classroom_member_can_list_flashcards_for_classroom_note(): void
    {
        $author = User::factory()->create();
        $member = User::factory()->create();
        $school = School::factory()->create();
        $classroom = Classroom::factory()->create(['school_id' => $school->id]);
        $note = Note::factory()->create([
            'author_id' => $author->id,
            'classroom_id' => $classroom->id,
            'visibility' => 'classroom',
        ]);
        Flashcard::factory()->count(3)->forNote($note)->create();
        ClassroomMember::factory()->create([
            'classroom_id' => $classroom->id,
            'user_id' => $member->id,
            'role' => 'member',
            'status' => 'active',
        ]);
        $token = $member->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson("/api/notes/{$note->id}/flashcards");

        $response->assertOk();
        $this->assertCount(3, $response->json('data'));
    }

    public function test_non_classroom_member_cannot_list_flashcards_for_classroom_note(): void
    {
        $author = User::factory()->create();
        $nonMember = User::factory()->create();
        $school = School::factory()->create();
        $classroom = Classroom::factory()->create(['school_id' => $school->id]);
        $note = Note::factory()->create([
            'author_id' => $author->id,
            'classroom_id' => $classroom->id,
            'visibility' => 'classroom',
        ]);
        Flashcard::factory()->count(3)->forNote($note)->create();
        $token = $nonMember->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson("/api/notes/{$note->id}/flashcards");

        $response->assertForbidden();
    }

    public function test_permitted_user_can_list_flashcards_for_specific_users_note(): void
    {
        $author = User::factory()->create();
        $permittedUser = User::factory()->create();
        $note = Note::factory()->create([
            'author_id' => $author->id,
            'visibility' => 'specific_users',
        ]);
        Flashcard::factory()->count(3)->forNote($note)->create();
        NotePermission::factory()->create([
            'note_id' => $note->id,
            'user_id' => $permittedUser->id,
        ]);
        $token = $permittedUser->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson("/api/notes/{$note->id}/flashcards");

        $response->assertOk();
        $this->assertCount(3, $response->json('data'));
    }

    public function test_list_flashcards_is_paginated(): void
    {
        $user = User::factory()->create();
        $note = Note::factory()->create([
            'author_id' => $user->id,
            'visibility' => 'public',
        ]);
        Flashcard::factory()->count(20)->forNote($note)->create();
        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson("/api/notes/{$note->id}/flashcards");

        $response->assertOk();
        $this->assertCount(15, $response->json('data'));
        $this->assertEquals(20, $response->json('meta.total'));
    }

    public function test_list_flashcards_returns_empty_for_note_with_no_flashcards(): void
    {
        $user = User::factory()->create();
        $note = Note::factory()->create([
            'author_id' => $user->id,
            'visibility' => 'public',
        ]);
        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson("/api/notes/{$note->id}/flashcards");

        $response->assertOk();
        $this->assertCount(0, $response->json('data'));
        $this->assertEquals(0, $response->json('meta.total'));
    }

    // ========================================
    // Flashcard Update Tests
    // ========================================

    public function test_author_can_update_flashcard(): void
    {
        $user = User::factory()->create();
        $note = Note::factory()->create([
            'author_id' => $user->id,
            'visibility' => 'public',
        ]);
        $flashcard = Flashcard::factory()->forNote($note)->create([
            'front' => 'Old front',
            'back' => 'Old back',
            'sort_order' => 0,
        ]);
        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->putJson("/api/flashcards/{$flashcard->id}", [
                'front_text' => 'New front',
                'back_text' => 'New back',
            ]);

        $response->assertOk()
            ->assertJsonPath('data.front_text', 'New front')
            ->assertJsonPath('data.back_text', 'New back');
    }

    public function test_author_can_update_flashcard_position(): void
    {
        $user = User::factory()->create();
        $note = Note::factory()->create([
            'author_id' => $user->id,
            'visibility' => 'public',
        ]);
        $flashcard = Flashcard::factory()->forNote($note)->create([
            'sort_order' => 0,
        ]);
        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->putJson("/api/flashcards/{$flashcard->id}", [
                'position' => 5,
            ]);

        $response->assertOk()
            ->assertJsonPath('data.position', 5);
    }

    public function test_non_author_cannot_update_flashcard(): void
    {
        $author = User::factory()->create();
        $otherUser = User::factory()->create();
        $note = Note::factory()->create([
            'author_id' => $author->id,
            'visibility' => 'public',
        ]);
        $flashcard = Flashcard::factory()->forNote($note)->create([
            'front' => 'Original',
        ]);
        $token = $otherUser->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->putJson("/api/flashcards/{$flashcard->id}", [
                'front_text' => 'Hacked',
            ]);

        $response->assertForbidden();

        $this->assertEquals('Original', $flashcard->fresh()->front);
    }

    public function test_guest_cannot_update_flashcard(): void
    {
        $author = User::factory()->create();
        $note = Note::factory()->create([
            'author_id' => $author->id,
            'visibility' => 'public',
        ]);
        $flashcard = Flashcard::factory()->forNote($note)->create([
            'front' => 'Original',
        ]);

        $response = $this->putJson("/api/flashcards/{$flashcard->id}", [
            'front_text' => 'Hacked',
        ]);

        $response->assertUnauthorized();
    }

    public function test_update_flashcard_validates_max_length(): void
    {
        $user = User::factory()->create();
        $note = Note::factory()->create([
            'author_id' => $user->id,
            'visibility' => 'public',
        ]);
        $flashcard = Flashcard::factory()->forNote($note)->create();
        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->putJson("/api/flashcards/{$flashcard->id}", [
                'front_text' => str_repeat('x', 1001),
            ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['front_text']);
    }

    public function test_update_flashcard_allows_partial_update(): void
    {
        $user = User::factory()->create();
        $note = Note::factory()->create([
            'author_id' => $user->id,
            'visibility' => 'public',
        ]);
        $flashcard = Flashcard::factory()->forNote($note)->create([
            'front' => 'Original front',
            'back' => 'Original back',
            'sort_order' => 3,
        ]);
        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->putJson("/api/flashcards/{$flashcard->id}", [
                'front_text' => 'Updated front only',
            ]);

        $response->assertOk()
            ->assertJsonPath('data.front_text', 'Updated front only')
            ->assertJsonPath('data.back_text', 'Original back')
            ->assertJsonPath('data.position', 3);
    }

    // ========================================
    // Flashcard Delete Tests
    // ========================================

    public function test_author_can_delete_flashcard(): void
    {
        $user = User::factory()->create();
        $note = Note::factory()->create([
            'author_id' => $user->id,
            'visibility' => 'public',
        ]);
        $flashcard = Flashcard::factory()->forNote($note)->create();
        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->deleteJson("/api/flashcards/{$flashcard->id}");

        $response->assertNoContent();

        $this->assertDatabaseMissing('flashcards', [
            'id' => $flashcard->id,
        ]);
    }

    public function test_non_author_cannot_delete_flashcard(): void
    {
        $author = User::factory()->create();
        $otherUser = User::factory()->create();
        $note = Note::factory()->create([
            'author_id' => $author->id,
            'visibility' => 'public',
        ]);
        $flashcard = Flashcard::factory()->forNote($note)->create();
        $token = $otherUser->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->deleteJson("/api/flashcards/{$flashcard->id}");

        $response->assertForbidden();

        $this->assertDatabaseHas('flashcards', [
            'id' => $flashcard->id,
        ]);
    }

    public function test_guest_cannot_delete_flashcard(): void
    {
        $author = User::factory()->create();
        $note = Note::factory()->create([
            'author_id' => $author->id,
            'visibility' => 'public',
        ]);
        $flashcard = Flashcard::factory()->forNote($note)->create();

        $response = $this->deleteJson("/api/flashcards/{$flashcard->id}");

        $response->assertUnauthorized();

        $this->assertDatabaseHas('flashcards', [
            'id' => $flashcard->id,
        ]);
    }

    // ========================================
    // Flashcard Resource Structure Tests
    // ========================================

    public function test_flashcard_resource_has_correct_structure(): void
    {
        $user = User::factory()->create();
        $note = Note::factory()->create([
            'author_id' => $user->id,
            'visibility' => 'public',
        ]);
        $flashcard = Flashcard::factory()->forNote($note)->create([
            'front' => 'What is 2+2?',
            'back' => '4',
            'sort_order' => 1,
        ]);
        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson("/api/notes/{$note->id}/flashcards");

        $response->assertOk()
            ->assertJsonStructure([
                'data' => [
                    '*' => [
                        'id',
                        'note_id',
                        'front_text',
                        'back_text',
                        'position',
                        'created_at',
                        'updated_at',
                    ],
                ],
                'meta' => ['current_page', 'last_page', 'per_page', 'total'],
            ]);
    }

    public function test_flashcard_resource_maps_correctly(): void
    {
        $user = User::factory()->create();
        $note = Note::factory()->create([
            'author_id' => $user->id,
            'visibility' => 'public',
        ]);
        $flashcard = Flashcard::factory()->forNote($note)->create([
            'front' => 'What is gravity?',
            'back' => 'A fundamental force.',
            'sort_order' => 5,
        ]);
        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson("/api/notes/{$note->id}/flashcards");

        $response->assertOk()
            ->assertJsonPath('data.0.id', $flashcard->id)
            ->assertJsonPath('data.0.note_id', $note->id)
            ->assertJsonPath('data.0.front_text', 'What is gravity?')
            ->assertJsonPath('data.0.back_text', 'A fundamental force.')
            ->assertJsonPath('data.0.position', 5);
    }
}
