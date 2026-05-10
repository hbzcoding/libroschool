<?php

namespace Tests\Feature;

use App\Models\Classroom;
use App\Models\ClassroomMember;
use App\Models\School;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ClassroomTest extends TestCase
{
    use RefreshDatabase;

    // ========================================
    // Classroom Creation Tests
    // ========================================

    public function test_authenticated_user_can_create_classroom(): void
    {
        $user = User::factory()->create(['role' => 'student']);
        $school = School::factory()->create();
        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson('/api/classrooms', [
                'school_id' => $school->id,
                'academic_year' => '2024-2025',
                'grade' => '3',
                'section' => 'A',
                'track' => 'scientific',
            ]);

        $response->assertCreated()
            ->assertJsonPath('data.school.id', $school->id)
            ->assertJsonPath('data.grade', '3')
            ->assertJsonPath('data.section', 'A')
            ->assertJsonPath('data.track', 'scientific')
            ->assertJsonPath('data.owner.id', $user->id);

        $this->assertDatabaseHas('classrooms', [
            'school_id' => $school->id,
            'academic_year' => '2024-2025',
            'grade' => '3',
            'section' => 'A',
            'track' => 'scientific',
            'owner_id' => $user->id,
        ]);

        // Owner is automatically added as member
        $this->assertDatabaseHas('classroom_members', [
            'user_id' => $user->id,
            'role' => 'owner',
            'status' => 'active',
        ]);
    }

    public function test_guest_cannot_create_classroom(): void
    {
        $school = School::factory()->create();

        $response = $this->postJson('/api/classrooms', [
            'school_id' => $school->id,
            'academic_year' => '2024-2025',
            'grade' => '3',
            'section' => 'A',
        ]);

        $response->assertUnauthorized();
    }

    public function test_create_classroom_validates_required_fields(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson('/api/classrooms', []);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['school_id', 'academic_year', 'grade', 'section']);
    }

    public function test_create_classroom_generates_join_code(): void
    {
        $user = User::factory()->create();
        $school = School::factory()->create();
        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson('/api/classrooms', [
                'school_id' => $school->id,
                'academic_year' => '2024-2025',
                'grade' => '3',
                'section' => 'A',
            ]);

        $response->assertCreated();

        $classroom = Classroom::first();
        $this->assertNotNull($classroom->join_code);
        $this->assertEquals(6, strlen($classroom->join_code));
    }

    public function test_create_classroom_unique_constraint_violation(): void
    {
        $user = User::factory()->create();
        $school = School::factory()->create();
        $token = $user->createToken('test-token')->plainTextToken;

        // Create first classroom
        Classroom::factory()->create([
            'school_id' => $school->id,
            'academic_year' => '2024-2025',
            'grade' => '3',
            'section' => 'A',
            'track' => 'scientific',
        ]);

        // Try to create duplicate
        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson('/api/classrooms', [
                'school_id' => $school->id,
                'academic_year' => '2024-2025',
                'grade' => '3',
                'section' => 'A',
                'track' => 'scientific',
            ]);

        $response->assertStatus(422)
            ->assertJsonPath('message', fn ($message) => str_contains($message, 'already exists'));
    }

    public function test_create_classroom_with_custom_name(): void
    {
        $user = User::factory()->create();
        $school = School::factory()->create();
        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson('/api/classrooms', [
                'school_id' => $school->id,
                'academic_year' => '2024-2025',
                'grade' => '3',
                'section' => 'A',
                'name' => 'My Custom Classroom',
            ]);

        $response->assertCreated()
            ->assertJsonPath('data.name', 'My Custom Classroom');
    }

    public function test_create_classroom_with_description(): void
    {
        $user = User::factory()->create();
        $school = School::factory()->create();
        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson('/api/classrooms', [
                'school_id' => $school->id,
                'academic_year' => '2024-2025',
                'grade' => '3',
                'section' => 'A',
                'description' => 'This is a test classroom',
            ]);

        $response->assertCreated()
            ->assertJsonPath('data.description', 'This is a test classroom');
    }

    // ========================================
    // Classroom Update Tests
    // ========================================

    public function test_owner_can_update_classroom(): void
    {
        $user = User::factory()->create();
        $school = School::factory()->create();
        $classroom = Classroom::factory()->create([
            'school_id' => $school->id,
            'owner_id' => $user->id,
        ]);
        ClassroomMember::factory()->create([
            'classroom_id' => $classroom->id,
            'user_id' => $user->id,
            'role' => 'owner',
        ]);
        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->putJson("/api/classrooms/{$classroom->id}", [
                'name' => 'Updated Name',
                'description' => 'Updated description',
            ]);

        $response->assertOk()
            ->assertJsonPath('data.name', 'Updated Name')
            ->assertJsonPath('data.description', 'Updated description');
    }

    public function test_non_owner_cannot_update_classroom(): void
    {
        $owner = User::factory()->create();
        $otherUser = User::factory()->create();
        $school = School::factory()->create();
        $classroom = Classroom::factory()->create([
            'school_id' => $school->id,
            'owner_id' => $owner->id,
        ]);
        $token = $otherUser->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->putJson("/api/classrooms/{$classroom->id}", [
                'name' => 'Updated Name',
            ]);

        $response->assertForbidden();
    }

    // ========================================
    // Classroom Delete Tests
    // ========================================

    public function test_owner_can_delete_classroom(): void
    {
        $user = User::factory()->create();
        $school = School::factory()->create();
        $classroom = Classroom::factory()->create([
            'school_id' => $school->id,
            'owner_id' => $user->id,
        ]);
        ClassroomMember::factory()->create([
            'classroom_id' => $classroom->id,
            'user_id' => $user->id,
            'role' => 'owner',
        ]);
        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->deleteJson("/api/classrooms/{$classroom->id}");

        $response->assertNoContent();

        $this->assertDatabaseMissing('classrooms', [
            'id' => $classroom->id,
        ]);
    }

    public function test_non_owner_cannot_delete_classroom(): void
    {
        $owner = User::factory()->create();
        $otherUser = User::factory()->create();
        $school = School::factory()->create();
        $classroom = Classroom::factory()->create([
            'school_id' => $school->id,
            'owner_id' => $owner->id,
        ]);
        $token = $otherUser->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->deleteJson("/api/classrooms/{$classroom->id}");

        $response->assertForbidden();
    }

    // ========================================
    // Classroom View Tests
    // ========================================

    public function test_user_can_view_public_classroom(): void
    {
        $school = School::factory()->create();
        $classroom = Classroom::factory()->create([
            'school_id' => $school->id,
            'visibility' => 'public',
        ]);

        $response = $this->getJson("/api/classrooms/{$classroom->id}");

        $response->assertOk()
            ->assertJsonPath('data.id', $classroom->id);
    }

    public function test_guest_can_view_public_classroom(): void
    {
        $school = School::factory()->create();
        $classroom = Classroom::factory()->create([
            'school_id' => $school->id,
            'visibility' => 'public',
        ]);

        $response = $this->getJson("/api/classrooms/{$classroom->id}");

        $response->assertOk();
    }

    public function test_non_member_cannot_view_private_classroom(): void
    {
        $user = User::factory()->create();
        $school = School::factory()->create();
        $classroom = Classroom::factory()->create([
            'school_id' => $school->id,
            'visibility' => 'private',
        ]);
        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson("/api/classrooms/{$classroom->id}");

        $response->assertForbidden();
    }

    public function test_member_can_view_private_classroom(): void
    {
        $user = User::factory()->create();
        $school = School::factory()->create();
        $classroom = Classroom::factory()->create([
            'school_id' => $school->id,
            'visibility' => 'private',
        ]);
        ClassroomMember::factory()->create([
            'classroom_id' => $classroom->id,
            'user_id' => $user->id,
            'role' => 'member',
            'status' => 'active',
        ]);

        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson("/api/classrooms/{$classroom->id}");

        $response->assertOk()
            ->assertJsonPath('data.id', $classroom->id);
    }

    public function test_owner_can_view_private_classroom(): void
    {
        $user = User::factory()->create();
        $school = School::factory()->create();
        $classroom = Classroom::factory()->create([
            'school_id' => $school->id,
            'owner_id' => $user->id,
            'visibility' => 'private',
        ]);
        ClassroomMember::factory()->create([
            'classroom_id' => $classroom->id,
            'user_id' => $user->id,
            'role' => 'owner',
            'status' => 'active',
        ]);
        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson("/api/classrooms/{$classroom->id}");

        $response->assertOk();
    }

    // ========================================
    // Classroom List Tests
    // ========================================

    public function test_user_can_list_classrooms(): void
    {
        $school = School::factory()->create();
        Classroom::factory()->count(10)->create([
            'school_id' => $school->id,
            'visibility' => 'public',
        ]);

        $response = $this->getJson('/api/classrooms');

        $response->assertOk()
            ->assertJsonStructure([
                'data' => [
                    '*' => ['id', 'name', 'grade', 'section', 'school', 'owner'],
                ],
                'meta' => ['current_page', 'last_page', 'per_page', 'total'],
            ]);

        $this->assertCount(10, $response->json('data'));
    }

    public function test_list_classrooms_filters_by_school(): void
    {
        $school1 = School::factory()->create();
        $school2 = School::factory()->create();
        Classroom::factory()->count(5)->create(['school_id' => $school1->id, 'visibility' => 'public']);
        Classroom::factory()->count(3)->create(['school_id' => $school2->id, 'visibility' => 'public']);

        $response = $this->getJson("/api/classrooms?school_id={$school1->id}");

        $response->assertOk();
        $this->assertEquals(5, $response->json('meta.total'));
    }

    public function test_list_classrooms_filters_by_grade(): void
    {
        $school = School::factory()->create();
        Classroom::factory()->count(5)->create(['school_id' => $school->id, 'grade' => '3', 'visibility' => 'public']);
        Classroom::factory()->count(3)->create(['school_id' => $school->id, 'grade' => '4', 'visibility' => 'public']);

        $response = $this->getJson('/api/classrooms?grade=3');

        $response->assertOk();
        $this->assertEquals(5, $response->json('meta.total'));
    }

    public function test_list_classrooms_filters_by_academic_year(): void
    {
        $school = School::factory()->create();
        Classroom::factory()->count(5)->create(['school_id' => $school->id, 'academic_year' => '2024-2025', 'visibility' => 'public']);
        Classroom::factory()->count(3)->create(['school_id' => $school->id, 'academic_year' => '2023-2024', 'visibility' => 'public']);

        $response = $this->getJson('/api/classrooms?academic_year=2024-2025');

        $response->assertOk();
        $this->assertEquals(5, $response->json('meta.total'));
    }

    public function test_list_classrooms_shows_private_classrooms_to_members(): void
    {
        $user = User::factory()->create();
        $school = School::factory()->create();
        Classroom::factory()->count(5)->create(['school_id' => $school->id, 'visibility' => 'public']);
        $privateClassroom = Classroom::factory()->create(['school_id' => $school->id, 'visibility' => 'private']);
        ClassroomMember::factory()->create([
            'classroom_id' => $privateClassroom->id,
            'user_id' => $user->id,
            'role' => 'member',
            'status' => 'active',
        ]);
        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/classrooms');

        $response->assertOk();
        // 5 public + 1 private that user is member of
        $this->assertEquals(6, $response->json('meta.total'));
    }

    public function test_list_classrooms_search_by_name(): void
    {
        $school = School::factory()->create();
        Classroom::factory()->create(['school_id' => $school->id, 'name' => 'Math Class 3A', 'visibility' => 'public']);
        Classroom::factory()->create(['school_id' => $school->id, 'name' => 'Science Class 3B', 'visibility' => 'public']);

        $response = $this->getJson('/api/classrooms?search=Math');

        $response->assertOk();
        $this->assertEquals(1, $response->json('meta.total'));
        $this->assertEquals('Math Class 3A', $response->json('data.0.name'));
    }

    // ========================================
    // Join Tests
    // ========================================

    public function test_user_can_join_public_classroom(): void
    {
        $user = User::factory()->create();
        $school = School::factory()->create();
        $classroom = Classroom::factory()->create([
            'school_id' => $school->id,
            'visibility' => 'public',
            'join_policy' => 'open',
        ]);
        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson("/api/classrooms/{$classroom->id}/join");

        $response->assertOk()
            ->assertJsonPath('data.member.role', 'member')
            ->assertJsonPath('data.member.status', 'active');

        $this->assertDatabaseHas('classroom_members', [
            'classroom_id' => $classroom->id,
            'user_id' => $user->id,
            'role' => 'member',
            'status' => 'active',
        ]);
    }

    public function test_user_cannot_join_classroom_with_code_policy(): void
    {
        $user = User::factory()->create();
        $school = School::factory()->create();
        $classroom = Classroom::factory()->create([
            'school_id' => $school->id,
            'visibility' => 'public',
            'join_policy' => 'code',
        ]);
        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson("/api/classrooms/{$classroom->id}/join");

        $response->assertStatus(403);
    }

    public function test_user_can_join_by_code(): void
    {
        $user = User::factory()->create();
        $school = School::factory()->create();
        $classroom = Classroom::factory()->create([
            'school_id' => $school->id,
            'join_code' => 'TEST12',
            'join_policy' => 'code',
            'visibility' => 'private',
        ]);
        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson('/api/classrooms/join-by-code', [
                'join_code' => 'TEST12',
            ]);

        $response->assertOk()
            ->assertJsonPath('data.classroom.id', $classroom->id);

        $this->assertDatabaseHas('classroom_members', [
            'classroom_id' => $classroom->id,
            'user_id' => $user->id,
            'role' => 'member',
            'status' => 'active',
        ]);
    }

    public function test_join_by_invalid_code_returns_error(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson('/api/classrooms/join-by-code', [
                'join_code' => 'INVALID',
            ]);

        $response->assertStatus(400)
            ->assertJsonPath('message', 'Invalid or expired join code.');
    }

    public function test_member_cannot_join_again(): void
    {
        $user = User::factory()->create();
        $school = School::factory()->create();
        $classroom = Classroom::factory()->create([
            'school_id' => $school->id,
            'visibility' => 'public',
            'join_policy' => 'open',
        ]);
        ClassroomMember::factory()->create([
            'classroom_id' => $classroom->id,
            'user_id' => $user->id,
            'role' => 'member',
            'status' => 'active',
        ]);
        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson("/api/classrooms/{$classroom->id}/join");

        $response->assertForbidden();
    }

    // ========================================
    // Leave Tests
    // ========================================

    public function test_member_can_leave_classroom(): void
    {
        $user = User::factory()->create();
        $school = School::factory()->create();
        $classroom = Classroom::factory()->create(['school_id' => $school->id]);
        ClassroomMember::factory()->create([
            'classroom_id' => $classroom->id,
            'user_id' => $user->id,
            'role' => 'member',
            'status' => 'active',
        ]);
        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson("/api/classrooms/{$classroom->id}/leave");

        $response->assertNoContent();

        $this->assertDatabaseMissing('classroom_members', [
            'classroom_id' => $classroom->id,
            'user_id' => $user->id,
        ]);
    }

    public function test_owner_cannot_leave_classroom(): void
    {
        $user = User::factory()->create();
        $school = School::factory()->create();
        $classroom = Classroom::factory()->create([
            'school_id' => $school->id,
            'owner_id' => $user->id,
        ]);
        ClassroomMember::factory()->create([
            'classroom_id' => $classroom->id,
            'user_id' => $user->id,
            'role' => 'owner',
            'status' => 'active',
        ]);
        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson("/api/classrooms/{$classroom->id}/leave");

        $response->assertForbidden();
    }

    // ========================================
    // Member Role Tests
    // ========================================

    public function test_owner_can_promote_member_to_moderator(): void
    {
        $owner = User::factory()->create();
        $member = User::factory()->create();
        $school = School::factory()->create();
        $classroom = Classroom::factory()->create([
            'school_id' => $school->id,
            'owner_id' => $owner->id,
        ]);
        ClassroomMember::factory()->create([
            'classroom_id' => $classroom->id,
            'user_id' => $owner->id,
            'role' => 'owner',
        ]);
        ClassroomMember::factory()->create([
            'classroom_id' => $classroom->id,
            'user_id' => $member->id,
            'role' => 'member',
        ]);
        $token = $owner->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson("/api/classrooms/{$classroom->id}/members/{$member->id}/role", [
                'role' => 'moderator',
            ]);

        $response->assertOk()
            ->assertJsonPath('data.role', 'moderator');

        $this->assertDatabaseHas('classroom_members', [
            'classroom_id' => $classroom->id,
            'user_id' => $member->id,
            'role' => 'moderator',
        ]);
    }

    public function test_moderator_can_promote_member_to_moderator(): void
    {
        $moderator = User::factory()->create();
        $member = User::factory()->create();
        $school = School::factory()->create();
        $classroom = Classroom::factory()->create(['school_id' => $school->id]);
        ClassroomMember::factory()->create([
            'classroom_id' => $classroom->id,
            'user_id' => $moderator->id,
            'role' => 'moderator',
        ]);
        ClassroomMember::factory()->create([
            'classroom_id' => $classroom->id,
            'user_id' => $member->id,
            'role' => 'member',
        ]);
        $token = $moderator->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson("/api/classrooms/{$classroom->id}/members/{$member->id}/role", [
                'role' => 'moderator',
            ]);

        $response->assertOk()
            ->assertJsonPath('data.role', 'moderator');
    }

    public function test_owner_can_demote_moderator_to_member(): void
    {
        $owner = User::factory()->create();
        $moderator = User::factory()->create();
        $school = School::factory()->create();
        $classroom = Classroom::factory()->create([
            'school_id' => $school->id,
            'owner_id' => $owner->id,
        ]);
        ClassroomMember::factory()->create([
            'classroom_id' => $classroom->id,
            'user_id' => $owner->id,
            'role' => 'owner',
        ]);
        ClassroomMember::factory()->create([
            'classroom_id' => $classroom->id,
            'user_id' => $moderator->id,
            'role' => 'moderator',
        ]);
        $token = $owner->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson("/api/classrooms/{$classroom->id}/members/{$moderator->id}/role", [
                'role' => 'member',
            ]);

        $response->assertOk()
            ->assertJsonPath('data.role', 'member');
    }

    public function test_owner_cannot_change_own_role(): void
    {
        $owner = User::factory()->create();
        $school = School::factory()->create();
        $classroom = Classroom::factory()->create([
            'school_id' => $school->id,
            'owner_id' => $owner->id,
        ]);
        ClassroomMember::factory()->create([
            'classroom_id' => $classroom->id,
            'user_id' => $owner->id,
            'role' => 'owner',
        ]);
        $token = $owner->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson("/api/classrooms/{$classroom->id}/members/{$owner->id}/role", [
                'role' => 'member',
            ]);

        $response->assertStatus(403);
    }

    public function test_regular_member_cannot_change_roles(): void
    {
        $member = User::factory()->create();
        $otherMember = User::factory()->create();
        $school = School::factory()->create();
        $classroom = Classroom::factory()->create(['school_id' => $school->id]);
        ClassroomMember::factory()->create([
            'classroom_id' => $classroom->id,
            'user_id' => $member->id,
            'role' => 'member',
        ]);
        ClassroomMember::factory()->create([
            'classroom_id' => $classroom->id,
            'user_id' => $otherMember->id,
            'role' => 'member',
        ]);
        $token = $member->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson("/api/classrooms/{$classroom->id}/members/{$otherMember->id}/role", [
                'role' => 'moderator',
            ]);

        $response->assertForbidden();
    }

    // ========================================
    // Remove Member Tests
    // ========================================

    public function test_owner_can_remove_member(): void
    {
        $owner = User::factory()->create();
        $member = User::factory()->create();
        $school = School::factory()->create();
        $classroom = Classroom::factory()->create([
            'school_id' => $school->id,
            'owner_id' => $owner->id,
        ]);
        ClassroomMember::factory()->create([
            'classroom_id' => $classroom->id,
            'user_id' => $owner->id,
            'role' => 'owner',
        ]);
        ClassroomMember::factory()->create([
            'classroom_id' => $classroom->id,
            'user_id' => $member->id,
            'role' => 'member',
        ]);
        $token = $owner->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->deleteJson("/api/classrooms/{$classroom->id}/members/{$member->id}");

        $response->assertNoContent();

        $this->assertDatabaseMissing('classroom_members', [
            'classroom_id' => $classroom->id,
            'user_id' => $member->id,
        ]);
    }

    public function test_moderator_cannot_remove_member(): void
    {
        $moderator = User::factory()->create();
        $member = User::factory()->create();
        $school = School::factory()->create();
        $classroom = Classroom::factory()->create(['school_id' => $school->id]);
        ClassroomMember::factory()->create([
            'classroom_id' => $classroom->id,
            'user_id' => $moderator->id,
            'role' => 'moderator',
        ]);
        ClassroomMember::factory()->create([
            'classroom_id' => $classroom->id,
            'user_id' => $member->id,
            'role' => 'member',
        ]);
        $token = $moderator->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->deleteJson("/api/classrooms/{$classroom->id}/members/{$member->id}");

        $response->assertForbidden();
    }

    public function test_owner_cannot_remove_themselves(): void
    {
        $owner = User::factory()->create();
        $school = School::factory()->create();
        $classroom = Classroom::factory()->create([
            'school_id' => $school->id,
            'owner_id' => $owner->id,
        ]);
        ClassroomMember::factory()->create([
            'classroom_id' => $classroom->id,
            'user_id' => $owner->id,
            'role' => 'owner',
        ]);
        $token = $owner->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->deleteJson("/api/classrooms/{$classroom->id}/members/{$owner->id}");

        $response->assertStatus(403);
    }

    // ========================================
    // Members List Tests
    // ========================================

    public function test_member_can_view_classroom_members(): void
    {
        $user = User::factory()->create();
        $school = School::factory()->create();
        $classroom = Classroom::factory()->create(['school_id' => $school->id]);
        ClassroomMember::factory()->create([
            'classroom_id' => $classroom->id,
            'user_id' => $user->id,
            'role' => 'member',
        ]);
        ClassroomMember::factory()->count(5)->create([
            'classroom_id' => $classroom->id,
        ]);
        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson("/api/classrooms/{$classroom->id}/members");

        $response->assertOk()
            ->assertJsonStructure([
                'data' => [
                    '*' => ['id', 'user', 'role', 'status'],
                ],
                'meta' => ['current_page', 'last_page', 'per_page', 'total'],
            ]);

        // 1 existing + 5 new = 6
        $this->assertEquals(6, $response->json('meta.total'));
    }

    public function test_non_member_cannot_view_classroom_members(): void
    {
        $user = User::factory()->create();
        $school = School::factory()->create();
        $classroom = Classroom::factory()->create([
            'school_id' => $school->id,
            'visibility' => 'private',
        ]);
        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson("/api/classrooms/{$classroom->id}/members");

        $response->assertForbidden();
    }

    // ========================================
    // Regenerate Join Code Tests
    // ========================================

    public function test_owner_can_regenerate_join_code(): void
    {
        $user = User::factory()->create();
        $school = School::factory()->create();
        $classroom = Classroom::factory()->create([
            'school_id' => $school->id,
            'owner_id' => $user->id,
            'join_code' => 'OLD123',
        ]);
        ClassroomMember::factory()->create([
            'classroom_id' => $classroom->id,
            'user_id' => $user->id,
            'role' => 'owner',
        ]);
        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson("/api/classrooms/{$classroom->id}/regenerate-join-code");

        $response->assertOk()
            ->assertJsonStructure(['data' => ['join_code']]);

        $this->assertNotEquals('OLD123', $response->json('data.join_code'));
    }

    public function test_moderator_can_regenerate_join_code(): void
    {
        $moderator = User::factory()->create();
        $school = School::factory()->create();
        $classroom = Classroom::factory()->create([
            'school_id' => $school->id,
            'join_code' => 'OLD123',
        ]);
        ClassroomMember::factory()->create([
            'classroom_id' => $classroom->id,
            'user_id' => $moderator->id,
            'role' => 'moderator',
        ]);
        $token = $moderator->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson("/api/classrooms/{$classroom->id}/regenerate-join-code");

        $response->assertOk();
    }

    public function test_regular_member_cannot_regenerate_join_code(): void
    {
        $member = User::factory()->create();
        $school = School::factory()->create();
        $classroom = Classroom::factory()->create(['school_id' => $school->id]);
        ClassroomMember::factory()->create([
            'classroom_id' => $classroom->id,
            'user_id' => $member->id,
            'role' => 'member',
        ]);
        $token = $member->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson("/api/classrooms/{$classroom->id}/regenerate-join-code");

        $response->assertForbidden();
    }

    // ========================================
    // Join Code Visibility Tests
    // ========================================

    public function test_join_code_visible_to_owner_only(): void
    {
        $owner = User::factory()->create();
        $member = User::factory()->create();
        $school = School::factory()->create();
        $classroom = Classroom::factory()->create([
            'school_id' => $school->id,
            'owner_id' => $owner->id,
            'join_code' => 'SECRET1',
        ]);
        ClassroomMember::factory()->create([
            'classroom_id' => $classroom->id,
            'user_id' => $owner->id,
            'role' => 'owner',
        ]);
        ClassroomMember::factory()->create([
            'classroom_id' => $classroom->id,
            'user_id' => $member->id,
            'role' => 'member',
        ]);

        // Owner can see join code
        $tokenOwner = $owner->createToken('test-token')->plainTextToken;
        $responseOwner = $this->withHeader('Authorization', "Bearer {$tokenOwner}")
            ->getJson("/api/classrooms/{$classroom->id}");
        $responseOwner->assertOk()
            ->assertJsonPath('data.join_code', 'SECRET1');

        // Regular member cannot see join code
        $tokenMember = $member->createToken('test-token')->plainTextToken;
        $responseMember = $this->withHeader('Authorization', "Bearer {$tokenMember}")
            ->getJson("/api/classrooms/{$classroom->id}");
        $responseMember->assertOk()
            ->assertJsonMissing(['join_code' => 'SECRET1']);
    }

    public function test_join_code_visible_to_moderator(): void
    {
        $moderator = User::factory()->create();
        $school = School::factory()->create();
        $classroom = Classroom::factory()->create([
            'school_id' => $school->id,
            'join_code' => 'SECRET1',
        ]);
        ClassroomMember::factory()->create([
            'classroom_id' => $classroom->id,
            'user_id' => $moderator->id,
            'role' => 'moderator',
        ]);

        $token = $moderator->createToken('test-token')->plainTextToken;
        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson("/api/classrooms/{$classroom->id}");

        $response->assertOk()
            ->assertJsonPath('data.join_code', 'SECRET1');
    }

    // ========================================
    // Pagination Tests
    // ========================================

    public function test_classroom_list_is_paginated(): void
    {
        $school = School::factory()->create();
        
        // Create classrooms with unique combinations to avoid unique constraint violation
        // Unique constraint: school_id + academic_year + grade + section + track
        Classroom::factory()->count(20)->sequence(function ($sequence) {
            $sections = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T'];
            return [
                'section' => $sections[$sequence->index] ?? 'Z',
            ];
        })->create([
            'school_id' => $school->id,
            'visibility' => 'public',
        ]);

        $response = $this->getJson('/api/classrooms');

        $response->assertOk();
        $this->assertCount(15, $response->json('data'));
        $this->assertEquals(20, $response->json('meta.total'));
    }

    public function test_members_list_is_paginated(): void
    {
        $user = User::factory()->create();
        $school = School::factory()->create();
        $classroom = Classroom::factory()->create(['school_id' => $school->id]);
        ClassroomMember::factory()->create([
            'classroom_id' => $classroom->id,
            'user_id' => $user->id,
            'role' => 'member',
        ]);
        ClassroomMember::factory()->count(20)->create([
            'classroom_id' => $classroom->id,
        ]);
        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson("/api/classrooms/{$classroom->id}/members");

        $response->assertOk();
        $this->assertCount(15, $response->json('data'));
        $this->assertEquals(21, $response->json('meta.total'));
    }

    // ========================================
    // Additional Authorization Tests
    // ========================================

    public function test_banned_member_cannot_view_private_classroom(): void
    {
        $user = User::factory()->create();
        $school = School::factory()->create();
        $classroom = Classroom::factory()->create([
            'school_id' => $school->id,
            'visibility' => 'private',
        ]);
        ClassroomMember::factory()->banned()->create([
            'classroom_id' => $classroom->id,
            'user_id' => $user->id,
        ]);
        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson("/api/classrooms/{$classroom->id}");

        $response->assertForbidden();
    }

    public function test_pending_member_can_join_by_code(): void
    {
        $user = User::factory()->create();
        $school = School::factory()->create();
        $classroom = Classroom::factory()->create([
            'school_id' => $school->id,
            'join_code' => 'TEST12',
            'join_policy' => 'approval',
        ]);
        ClassroomMember::factory()->pending()->create([
            'classroom_id' => $classroom->id,
            'user_id' => $user->id,
        ]);
        $token = $user->createToken('test-token')->plainTextToken;

        // Even pending members can see the classroom details after joining by code
        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson('/api/classrooms/join-by-code', [
                'join_code' => 'TEST12',
            ]);

        // Pending status should remain for approval policy
        $response->assertOk();
    }
}
