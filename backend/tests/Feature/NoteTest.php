<?php

namespace Tests\Feature;

use App\Models\Classroom;
use App\Models\ClassroomMember;
use App\Models\Note;
use App\Models\NotePermission;
use App\Models\School;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class NoteTest extends TestCase
{
    use RefreshDatabase;

    // ========================================
    // Note Creation Tests
    // ========================================

    public function test_authenticated_user_can_create_note(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson('/api/notes', [
                'title' => 'My Study Notes',
                'content' => 'Some content here',
                'visibility' => 'public',
                'mode' => 'normal',
            ]);

        $response->assertCreated()
            ->assertJsonPath('data.title', 'My Study Notes')
            ->assertJsonPath('data.visibility', 'public')
            ->assertJsonPath('data.mode', 'normal')
            ->assertJsonPath('data.author.id', $user->id);

        $this->assertDatabaseHas('notes', [
            'author_id' => $user->id,
            'title' => 'My Study Notes',
            'visibility' => 'public',
        ]);
    }

    public function test_guest_cannot_create_note(): void
    {
        $response = $this->postJson('/api/notes', [
            'title' => 'My Study Notes',
            'visibility' => 'public',
            'mode' => 'normal',
        ]);

        $response->assertUnauthorized();
    }

    public function test_create_note_validates_required_fields(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson('/api/notes', []);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['title', 'visibility', 'mode']);
    }

    public function test_create_private_note(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson('/api/notes', [
                'title' => 'Private Notes',
                'visibility' => 'private',
                'mode' => 'normal',
            ]);

        $response->assertCreated()
            ->assertJsonPath('data.visibility', 'private');
    }

    public function test_create_flashcard_mode_note(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson('/api/notes', [
                'title' => 'Flashcard Notes',
                'visibility' => 'public',
                'mode' => 'flashcard',
            ]);

        $response->assertCreated()
            ->assertJsonPath('data.mode', 'flashcard');
    }

    public function test_create_classroom_note_requires_classroom_id(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson('/api/notes', [
                'title' => 'Classroom Note',
                'visibility' => 'classroom',
                'mode' => 'normal',
            ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['classroom_id']);
    }

    public function test_create_classroom_note_with_classroom_id(): void
    {
        $user = User::factory()->create();
        $school = School::factory()->create();
        $classroom = Classroom::factory()->create([
            'school_id' => $school->id,
        ]);
        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson('/api/notes', [
                'title' => 'Classroom Note',
                'visibility' => 'classroom',
                'mode' => 'normal',
                'classroom_id' => $classroom->id,
            ]);

        $response->assertCreated()
            ->assertJsonPath('data.visibility', 'classroom')
            ->assertJsonPath('data.classroom.id', $classroom->id);
    }

    public function test_create_specific_users_note(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson('/api/notes', [
                'title' => 'Specific Users Note',
                'visibility' => 'specific_users',
                'mode' => 'normal',
            ]);

        $response->assertCreated()
            ->assertJsonPath('data.visibility', 'specific_users');
    }

    public function test_create_note_with_school(): void
    {
        $user = User::factory()->create();
        $school = School::factory()->create();
        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson('/api/notes', [
                'title' => 'School Note',
                'visibility' => 'public',
                'mode' => 'normal',
                'school_id' => $school->id,
            ]);

        $response->assertCreated()
            ->assertJsonPath('data.school.id', $school->id);
    }

    public function test_create_note_with_subject_and_grade(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson('/api/notes', [
                'title' => 'Math Notes',
                'content' => 'Calculus basics',
                'subject' => 'Math',
                'grade' => 3,
                'visibility' => 'public',
                'mode' => 'normal',
            ]);

        $response->assertCreated()
            ->assertJsonPath('data.subject', 'Math')
            ->assertJsonPath('data.grade', 3);
    }

    public function test_create_note_validates_invalid_visibility(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson('/api/notes', [
                'title' => 'Test Note',
                'visibility' => 'invalid',
                'mode' => 'normal',
            ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['visibility']);
    }

    public function test_create_note_validates_invalid_mode(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson('/api/notes', [
                'title' => 'Test Note',
                'visibility' => 'public',
                'mode' => 'invalid',
            ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['mode']);
    }

    // ========================================
    // Note View Tests - Visibility
    // ========================================

    public function test_user_can_view_own_private_note(): void
    {
        $user = User::factory()->create();
        $note = Note::factory()->create([
            'author_id' => $user->id,
            'visibility' => 'private',
        ]);
        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson("/api/notes/{$note->id}");

        $response->assertOk()
            ->assertJsonPath('data.id', $note->id);
    }

    public function test_user_cannot_view_others_private_note(): void
    {
        $author = User::factory()->create();
        $otherUser = User::factory()->create();
        $note = Note::factory()->create([
            'author_id' => $author->id,
            'visibility' => 'private',
        ]);
        $token = $otherUser->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson("/api/notes/{$note->id}");

        $response->assertForbidden();
    }

    public function test_guest_cannot_view_private_note(): void
    {
        $author = User::factory()->create();
        $note = Note::factory()->create([
            'author_id' => $author->id,
            'visibility' => 'private',
        ]);

        $response = $this->getJson("/api/notes/{$note->id}");

        $response->assertForbidden();
    }

    public function test_user_can_view_public_notes_from_others(): void
    {
        $author = User::factory()->create();
        $user = User::factory()->create();
        $note = Note::factory()->create([
            'author_id' => $author->id,
            'visibility' => 'public',
        ]);
        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson("/api/notes/{$note->id}");

        $response->assertOk()
            ->assertJsonPath('data.id', $note->id);
    }

    public function test_guest_can_view_public_notes(): void
    {
        $author = User::factory()->create();
        $note = Note::factory()->create([
            'author_id' => $author->id,
            'visibility' => 'public',
        ]);

        $response = $this->getJson("/api/notes/{$note->id}");

        $response->assertOk()
            ->assertJsonPath('data.id', $note->id);
    }

    public function test_classroom_note_visible_to_classroom_members(): void
    {
        $author = User::factory()->create();
        $member = User::factory()->create();
        $school = School::factory()->create();
        $classroom = Classroom::factory()->create([
            'school_id' => $school->id,
        ]);
        $note = Note::factory()->create([
            'author_id' => $author->id,
            'classroom_id' => $classroom->id,
            'visibility' => 'classroom',
        ]);
        ClassroomMember::factory()->create([
            'classroom_id' => $classroom->id,
            'user_id' => $member->id,
            'role' => 'member',
            'status' => 'active',
        ]);
        $token = $member->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson("/api/notes/{$note->id}");

        $response->assertOk()
            ->assertJsonPath('data.id', $note->id);
    }

    public function test_classroom_note_not_visible_to_non_members(): void
    {
        $author = User::factory()->create();
        $nonMember = User::factory()->create();
        $school = School::factory()->create();
        $classroom = Classroom::factory()->create([
            'school_id' => $school->id,
        ]);
        $note = Note::factory()->create([
            'author_id' => $author->id,
            'classroom_id' => $classroom->id,
            'visibility' => 'classroom',
        ]);
        $token = $nonMember->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson("/api/notes/{$note->id}");

        $response->assertForbidden();
    }

    public function test_classroom_note_visible_to_author(): void
    {
        $author = User::factory()->create();
        $school = School::factory()->create();
        $classroom = Classroom::factory()->create([
            'school_id' => $school->id,
        ]);
        $note = Note::factory()->create([
            'author_id' => $author->id,
            'classroom_id' => $classroom->id,
            'visibility' => 'classroom',
        ]);
        $token = $author->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson("/api/notes/{$note->id}");

        $response->assertOk()
            ->assertJsonPath('data.id', $note->id);
    }

    public function test_specific_users_note_visible_to_permitted_user(): void
    {
        $author = User::factory()->create();
        $permittedUser = User::factory()->create();
        $note = Note::factory()->create([
            'author_id' => $author->id,
            'visibility' => 'specific_users',
        ]);
        NotePermission::factory()->create([
            'note_id' => $note->id,
            'user_id' => $permittedUser->id,
        ]);
        $token = $permittedUser->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson("/api/notes/{$note->id}");

        $response->assertOk()
            ->assertJsonPath('data.id', $note->id)
            ->assertJsonStructure([
                'data' => ['permitted_users'],
            ]);
    }

    public function test_specific_users_note_not_visible_to_non_permitted_user(): void
    {
        $author = User::factory()->create();
        $nonPermittedUser = User::factory()->create();
        $note = Note::factory()->create([
            'author_id' => $author->id,
            'visibility' => 'specific_users',
        ]);
        $token = $nonPermittedUser->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson("/api/notes/{$note->id}");

        $response->assertForbidden();
    }

    public function test_specific_users_note_visible_to_author(): void
    {
        $author = User::factory()->create();
        $note = Note::factory()->create([
            'author_id' => $author->id,
            'visibility' => 'specific_users',
        ]);
        $token = $author->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson("/api/notes/{$note->id}");

        $response->assertOk()
            ->assertJsonPath('data.id', $note->id);
    }

    public function test_banned_classroom_member_cannot_see_classroom_note(): void
    {
        $author = User::factory()->create();
        $bannedMember = User::factory()->create();
        $school = School::factory()->create();
        $classroom = Classroom::factory()->create([
            'school_id' => $school->id,
        ]);
        $note = Note::factory()->create([
            'author_id' => $author->id,
            'classroom_id' => $classroom->id,
            'visibility' => 'classroom',
        ]);
        ClassroomMember::factory()->create([
            'classroom_id' => $classroom->id,
            'user_id' => $bannedMember->id,
            'role' => 'member',
            'status' => 'banned',
        ]);
        $token = $bannedMember->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson("/api/notes/{$note->id}");

        $response->assertForbidden();
    }

    // ========================================
    // Note Update Tests
    // ========================================

    public function test_author_can_update_note(): void
    {
        $user = User::factory()->create();
        $note = Note::factory()->create([
            'author_id' => $user->id,
            'visibility' => 'private',
        ]);
        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->putJson("/api/notes/{$note->id}", [
                'title' => 'Updated Title',
                'visibility' => 'public',
            ]);

        $response->assertOk()
            ->assertJsonPath('data.title', 'Updated Title')
            ->assertJsonPath('data.visibility', 'public');
    }

    public function test_non_author_cannot_update_note(): void
    {
        $author = User::factory()->create();
        $otherUser = User::factory()->create();
        $note = Note::factory()->create([
            'author_id' => $author->id,
            'visibility' => 'private',
        ]);
        $token = $otherUser->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->putJson("/api/notes/{$note->id}", [
                'title' => 'Hacked Title',
            ]);

        $response->assertForbidden();
    }

    public function test_guest_cannot_update_note(): void
    {
        $author = User::factory()->create();
        $note = Note::factory()->create([
            'author_id' => $author->id,
            'visibility' => 'public',
        ]);

        $response = $this->putJson("/api/notes/{$note->id}", [
            'title' => 'Hacked Title',
        ]);

        $response->assertUnauthorized();
    }

    public function test_author_can_change_visibility_to_classroom(): void
    {
        $user = User::factory()->create();
        $school = School::factory()->create();
        $classroom = Classroom::factory()->create([
            'school_id' => $school->id,
        ]);
        $note = Note::factory()->create([
            'author_id' => $user->id,
            'visibility' => 'private',
        ]);
        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->putJson("/api/notes/{$note->id}", [
                'visibility' => 'classroom',
                'classroom_id' => $classroom->id,
            ]);

        $response->assertOk()
            ->assertJsonPath('data.visibility', 'classroom')
            ->assertJsonPath('data.classroom.id', $classroom->id);
    }

    // ========================================
    // Note Delete Tests
    // ========================================

    public function test_author_can_delete_note(): void
    {
        $user = User::factory()->create();
        $note = Note::factory()->create([
            'author_id' => $user->id,
            'visibility' => 'private',
        ]);
        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->deleteJson("/api/notes/{$note->id}");

        $response->assertNoContent();

        $this->assertDatabaseMissing('notes', [
            'id' => $note->id,
        ]);
    }

    public function test_non_author_cannot_delete_note(): void
    {
        $author = User::factory()->create();
        $otherUser = User::factory()->create();
        $note = Note::factory()->create([
            'author_id' => $author->id,
            'visibility' => 'public',
        ]);
        $token = $otherUser->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->deleteJson("/api/notes/{$note->id}");

        $response->assertForbidden();

        $this->assertDatabaseHas('notes', [
            'id' => $note->id,
        ]);
    }

    public function test_guest_cannot_delete_note(): void
    {
        $author = User::factory()->create();
        $note = Note::factory()->create([
            'author_id' => $author->id,
            'visibility' => 'public',
        ]);

        $response = $this->deleteJson("/api/notes/{$note->id}");

        $response->assertUnauthorized();
    }

    public function test_deleting_note_also_deletes_permissions(): void
    {
        $author = User::factory()->create();
        $otherUser = User::factory()->create();
        $note = Note::factory()->create([
            'author_id' => $author->id,
            'visibility' => 'specific_users',
        ]);
        NotePermission::factory()->create([
            'note_id' => $note->id,
            'user_id' => $otherUser->id,
        ]);
        $token = $author->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->deleteJson("/api/notes/{$note->id}");

        $response->assertNoContent();

        $this->assertDatabaseMissing('notes', ['id' => $note->id]);
        $this->assertDatabaseMissing('note_permissions', ['note_id' => $note->id]);
    }

    // ========================================
    // Note List Tests
    // ========================================

    public function test_user_can_list_notes(): void
    {
        $author = User::factory()->create();
        Note::factory()->count(5)->create([
            'author_id' => $author->id,
            'visibility' => 'public',
        ]);

        $response = $this->getJson('/api/notes');

        $response->assertOk()
            ->assertJsonStructure([
                'data' => [
                    '*' => ['id', 'title', 'visibility', 'mode', 'author'],
                ],
                'meta' => ['current_page', 'last_page', 'per_page', 'total'],
            ]);

        $this->assertCount(5, $response->json('data'));
    }

    public function test_list_notes_shows_private_notes_to_author_only(): void
    {
        $author = User::factory()->create();
        $otherUser = User::factory()->create();
        Note::factory()->count(3)->create([
            'author_id' => $author->id,
            'visibility' => 'public',
        ]);
        Note::factory()->count(2)->create([
            'author_id' => $author->id,
            'visibility' => 'private',
        ]);
        Note::factory()->count(2)->create([
            'author_id' => $otherUser->id,
            'visibility' => 'private',
        ]);
        $token = $author->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/notes');

        $response->assertOk();
        // 3 public + 2 own private = 5
        $this->assertEquals(5, $response->json('meta.total'));
    }

    public function test_list_notes_shows_classroom_notes_to_members(): void
    {
        $author = User::factory()->create();
        $member = User::factory()->create();
        $school = School::factory()->create();
        $classroom = Classroom::factory()->create([
            'school_id' => $school->id,
        ]);
        Note::factory()->count(3)->create([
            'author_id' => $author->id,
            'visibility' => 'public',
        ]);
        Note::factory()->count(2)->create([
            'author_id' => $author->id,
            'classroom_id' => $classroom->id,
            'visibility' => 'classroom',
        ]);
        ClassroomMember::factory()->create([
            'classroom_id' => $classroom->id,
            'user_id' => $member->id,
            'role' => 'member',
            'status' => 'active',
        ]);
        $token = $member->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/notes');

        $response->assertOk();
        // 3 public + 2 classroom notes = 5
        $this->assertEquals(5, $response->json('meta.total'));
    }

    public function test_list_notes_shows_specific_users_notes_to_permitted(): void
    {
        $author = User::factory()->create();
        $permittedUser = User::factory()->create();
        Note::factory()->count(3)->create([
            'author_id' => $author->id,
            'visibility' => 'public',
        ]);
        $specificNote = Note::factory()->create([
            'author_id' => $author->id,
            'visibility' => 'specific_users',
        ]);
        NotePermission::factory()->create([
            'note_id' => $specificNote->id,
            'user_id' => $permittedUser->id,
        ]);
        $token = $permittedUser->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/notes');

        $response->assertOk();
        // 3 public + 1 specific_users = 4
        $this->assertEquals(4, $response->json('meta.total'));
    }

    public function test_list_notes_filters_by_school_id(): void
    {
        $school1 = School::factory()->create();
        $school2 = School::factory()->create();
        Note::factory()->count(3)->create([
            'school_id' => $school1->id,
            'visibility' => 'public',
        ]);
        Note::factory()->count(2)->create([
            'school_id' => $school2->id,
            'visibility' => 'public',
        ]);

        $response = $this->getJson("/api/notes?school_id={$school1->id}");

        $response->assertOk();
        $this->assertEquals(3, $response->json('meta.total'));
    }

    public function test_list_notes_filters_by_classroom_id(): void
    {
        $author = User::factory()->create();
        $member = User::factory()->create();
        $school = School::factory()->create();
        $classroom1 = Classroom::factory()->create(['school_id' => $school->id]);
        $classroom2 = Classroom::factory()->create(['school_id' => $school->id]);
        Note::factory()->count(3)->create([
            'author_id' => $author->id,
            'classroom_id' => $classroom1->id,
            'visibility' => 'classroom',
        ]);
        Note::factory()->count(2)->create([
            'author_id' => $author->id,
            'classroom_id' => $classroom2->id,
            'visibility' => 'classroom',
        ]);
        ClassroomMember::factory()->create([
            'classroom_id' => $classroom1->id,
            'user_id' => $member->id,
            'role' => 'member',
            'status' => 'active',
        ]);
        ClassroomMember::factory()->create([
            'classroom_id' => $classroom2->id,
            'user_id' => $member->id,
            'role' => 'member',
            'status' => 'active',
        ]);
        $token = $member->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson("/api/notes?classroom_id={$classroom1->id}");

        $response->assertOk();
        $this->assertEquals(3, $response->json('meta.total'));
    }

    public function test_list_notes_filters_by_subject(): void
    {
        Note::factory()->count(3)->create(['subject' => 'Math', 'visibility' => 'public']);
        Note::factory()->count(2)->create(['subject' => 'Science', 'visibility' => 'public']);

        $response = $this->getJson('/api/notes?subject=Math');

        $response->assertOk();
        $this->assertEquals(3, $response->json('meta.total'));
    }

    public function test_list_notes_filters_by_grade(): void
    {
        Note::factory()->count(3)->create(['grade' => 3, 'visibility' => 'public']);
        Note::factory()->count(2)->create(['grade' => 4, 'visibility' => 'public']);

        $response = $this->getJson('/api/notes?grade=3');

        $response->assertOk();
        $this->assertEquals(3, $response->json('meta.total'));
    }

    public function test_list_notes_filters_by_visibility(): void
    {
        Note::factory()->count(3)->create(['visibility' => 'public']);
        Note::factory()->count(2)->create(['visibility' => 'public']);

        $response = $this->getJson('/api/notes?visibility=public');

        $response->assertOk();
        $this->assertEquals(5, $response->json('meta.total'));
    }

    public function test_list_notes_filters_by_mode(): void
    {
        Note::factory()->count(3)->create(['mode' => 'normal', 'visibility' => 'public']);
        Note::factory()->count(2)->create(['mode' => 'flashcard', 'visibility' => 'public']);

        $response = $this->getJson('/api/notes?mode=flashcard');

        $response->assertOk();
        $this->assertEquals(2, $response->json('meta.total'));
    }

    public function test_list_notes_search_by_title(): void
    {
        Note::factory()->create(['title' => 'Math Study Guide', 'visibility' => 'public']);
        Note::factory()->create(['title' => 'History Notes', 'visibility' => 'public']);
        Note::factory()->create(['title' => 'Math Formulas', 'visibility' => 'public']);

        $response = $this->getJson('/api/notes?search=Math');

        $response->assertOk();
        $this->assertEquals(2, $response->json('meta.total'));
    }

    public function test_list_notes_is_paginated(): void
    {
        Note::factory()->count(20)->create(['visibility' => 'public']);

        $response = $this->getJson('/api/notes');

        $response->assertOk();
        $this->assertCount(15, $response->json('data'));
        $this->assertEquals(20, $response->json('meta.total'));
    }

    // ========================================
    // Permission Management Tests
    // ========================================

    public function test_author_can_grant_permission_for_specific_users_note(): void
    {
        $author = User::factory()->create();
        $targetUser = User::factory()->create();
        $note = Note::factory()->create([
            'author_id' => $author->id,
            'visibility' => 'specific_users',
        ]);
        $token = $author->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson("/api/notes/{$note->id}/permissions", [
                'user_id' => $targetUser->id,
            ]);

        $response->assertCreated()
            ->assertJsonPath('data.user.id', $targetUser->id);

        $this->assertDatabaseHas('note_permissions', [
            'note_id' => $note->id,
            'user_id' => $targetUser->id,
        ]);
    }

    public function test_non_author_cannot_grant_permission(): void
    {
        $author = User::factory()->create();
        $otherUser = User::factory()->create();
        $targetUser = User::factory()->create();
        $note = Note::factory()->create([
            'author_id' => $author->id,
            'visibility' => 'specific_users',
        ]);
        $token = $otherUser->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson("/api/notes/{$note->id}/permissions", [
                'user_id' => $targetUser->id,
            ]);

        $response->assertForbidden();
    }

    public function test_cannot_grant_permission_for_public_note(): void
    {
        $author = User::factory()->create();
        $targetUser = User::factory()->create();
        $note = Note::factory()->create([
            'author_id' => $author->id,
            'visibility' => 'public',
        ]);
        $token = $author->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson("/api/notes/{$note->id}/permissions", [
                'user_id' => $targetUser->id,
            ]);

        $response->assertForbidden();
    }

    public function test_cannot_grant_permission_for_private_note(): void
    {
        $author = User::factory()->create();
        $targetUser = User::factory()->create();
        $note = Note::factory()->create([
            'author_id' => $author->id,
            'visibility' => 'private',
        ]);
        $token = $author->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson("/api/notes/{$note->id}/permissions", [
                'user_id' => $targetUser->id,
            ]);

        $response->assertForbidden();
    }

    public function test_cannot_grant_permission_for_classroom_note(): void
    {
        $author = User::factory()->create();
        $school = School::factory()->create();
        $classroom = Classroom::factory()->create(['school_id' => $school->id]);
        $targetUser = User::factory()->create();
        $note = Note::factory()->create([
            'author_id' => $author->id,
            'visibility' => 'classroom',
            'classroom_id' => $classroom->id,
        ]);
        $token = $author->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson("/api/notes/{$note->id}/permissions", [
                'user_id' => $targetUser->id,
            ]);

        $response->assertForbidden();
    }

    public function test_cannot_grant_duplicate_permission(): void
    {
        $author = User::factory()->create();
        $targetUser = User::factory()->create();
        $note = Note::factory()->create([
            'author_id' => $author->id,
            'visibility' => 'specific_users',
        ]);
        NotePermission::factory()->create([
            'note_id' => $note->id,
            'user_id' => $targetUser->id,
        ]);
        $token = $author->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson("/api/notes/{$note->id}/permissions", [
                'user_id' => $targetUser->id,
            ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['user_id']);
    }

    public function test_author_can_revoke_permission(): void
    {
        $author = User::factory()->create();
        $targetUser = User::factory()->create();
        $note = Note::factory()->create([
            'author_id' => $author->id,
            'visibility' => 'specific_users',
        ]);
        NotePermission::factory()->create([
            'note_id' => $note->id,
            'user_id' => $targetUser->id,
        ]);
        $token = $author->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->deleteJson("/api/notes/{$note->id}/permissions/{$targetUser->id}");

        $response->assertNoContent();

        $this->assertDatabaseMissing('note_permissions', [
            'note_id' => $note->id,
            'user_id' => $targetUser->id,
        ]);
    }

    public function test_non_author_cannot_revoke_permission(): void
    {
        $author = User::factory()->create();
        $otherUser = User::factory()->create();
        $targetUser = User::factory()->create();
        $note = Note::factory()->create([
            'author_id' => $author->id,
            'visibility' => 'specific_users',
        ]);
        NotePermission::factory()->create([
            'note_id' => $note->id,
            'user_id' => $targetUser->id,
        ]);
        $token = $otherUser->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->deleteJson("/api/notes/{$note->id}/permissions/{$targetUser->id}");

        $response->assertForbidden();
    }

    public function test_cannot_revoke_permission_from_public_note(): void
    {
        $author = User::factory()->create();
        $targetUser = User::factory()->create();
        $note = Note::factory()->create([
            'author_id' => $author->id,
            'visibility' => 'public',
        ]);
        $token = $author->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->deleteJson("/api/notes/{$note->id}/permissions/{$targetUser->id}");

        $response->assertForbidden();
    }

    public function test_grant_permission_validates_user_exists(): void
    {
        $author = User::factory()->create();
        $note = Note::factory()->create([
            'author_id' => $author->id,
            'visibility' => 'specific_users',
        ]);
        $token = $author->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson("/api/notes/{$note->id}/permissions", [
                'user_id' => 99999,
            ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['user_id']);
    }

    public function test_grant_permission_validates_user_id_required(): void
    {
        $author = User::factory()->create();
        $note = Note::factory()->create([
            'author_id' => $author->id,
            'visibility' => 'specific_users',
        ]);
        $token = $author->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson("/api/notes/{$note->id}/permissions", []);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['user_id']);
    }

    // ========================================
    // Note Resource Structure Tests
    // ========================================

    public function test_note_resource_has_correct_structure(): void
    {
        $user = User::factory()->create();
        $note = Note::factory()->create([
            'author_id' => $user->id,
            'visibility' => 'public',
            'mode' => 'normal',
            'subject' => 'Math',
            'grade' => 3,
        ]);
        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson("/api/notes/{$note->id}");

        $response->assertOk()
            ->assertJsonStructure([
                'data' => [
                    'id',
                    'author',
                    'title',
                    'subject',
                    'grade',
                    'content',
                    'visibility',
                    'mode',
                    'created_at',
                    'updated_at',
                ],
            ]);
    }

    public function test_note_show_includes_school_when_set(): void
    {
        $user = User::factory()->create();
        $school = School::factory()->create();
        $note = Note::factory()->create([
            'author_id' => $user->id,
            'school_id' => $school->id,
            'visibility' => 'public',
        ]);
        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson("/api/notes/{$note->id}");

        $response->assertOk()
            ->assertJsonPath('data.school.id', $school->id);
    }
}