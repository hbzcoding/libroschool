<?php

namespace Tests\Feature;

use App\Models\Book;
use App\Models\BookRequest;
use App\Models\Classroom;
use App\Models\Note;
use App\Models\Report;
use App\Models\School;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminTest extends TestCase
{
    use RefreshDatabase;

    // ==================== Admin Users ====================

    public function test_admin_can_list_users(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        User::factory()->count(20)->create();

        $token = $admin->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/admin/users');

        $response->assertOk()
            ->assertJsonStructure([
                'data' => [
                    '*' => ['id', 'name', 'email', 'role', 'school_id', 'grade', 'track', 'created_at'],
                ],
                'meta' => ['current_page', 'last_page', 'per_page', 'total'],
            ]);

        $this->assertCount(15, $response->json('data'));
        $this->assertEquals(21, $response->json('meta.total'));
    }

    public function test_non_admin_cannot_list_users(): void
    {
        $user = User::factory()->create(['role' => 'student']);
        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/admin/users');

        $response->assertForbidden();
    }

    public function test_admin_can_filter_users_by_role(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        User::factory()->count(5)->create(['role' => 'student']);
        User::factory()->count(3)->create(['role' => 'teacher']);

        $token = $admin->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/admin/users?role=student');

        $response->assertOk();
        $this->assertEquals(5, $response->json('meta.total'));
    }

    public function test_admin_can_search_users(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        User::factory()->create(['name' => 'John Doe', 'email' => 'john@example.com']);
        User::factory()->create(['name' => 'Jane Smith', 'email' => 'jane@example.com']);

        $token = $admin->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/admin/users?search=john');

        $response->assertOk();
        $this->assertEquals(1, $response->json('meta.total'));
    }

    public function test_admin_can_show_user(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $user = User::factory()->create();

        $token = $admin->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson("/api/admin/users/{$user->id}");

        $response->assertOk()
            ->assertJsonPath('data.id', $user->id)
            ->assertJsonPath('data.name', $user->name);
    }

    public function test_admin_can_update_user(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $user = User::factory()->create(['role' => 'student']);

        $token = $admin->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->putJson("/api/admin/users/{$user->id}", [
                'role' => 'teacher',
            ]);

        $response->assertOk()
            ->assertJsonPath('data.role', 'teacher');

        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'role' => 'teacher',
        ]);
    }

    public function test_admin_can_ban_user(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $user = User::factory()->create(['role' => 'student']);

        $token = $admin->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson("/api/admin/users/{$user->id}/ban");

        $response->assertOk()
            ->assertJsonPath('data.role', 'banned');
    }

    public function test_admin_cannot_ban_another_admin(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $anotherAdmin = User::factory()->create(['role' => 'admin']);

        $token = $admin->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson("/api/admin/users/{$anotherAdmin->id}/ban");

        $response->assertStatus(403)
            ->assertJsonPath('message', 'Cannot ban an admin user.');
    }

    // ==================== Admin Books ====================

    public function test_admin_can_list_all_books(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        Book::factory()->count(20)->create();

        $token = $admin->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/admin/books');

        $response->assertOk();
        $this->assertEquals(20, $response->json('meta.total'));
    }

    public function test_admin_can_show_book(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $book = Book::factory()->create();

        $token = $admin->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson("/api/admin/books/{$book->id}");

        $response->assertOk()
            ->assertJsonPath('data.id', $book->id);
    }

    public function test_admin_can_hide_book(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $book = Book::factory()->create(['status' => 'available']);

        $token = $admin->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson("/api/admin/books/{$book->id}/hide");

        $response->assertOk()
            ->assertJsonPath('data.status', 'hidden');

        $this->assertDatabaseHas('books', [
            'id' => $book->id,
            'status' => 'hidden',
        ]);
    }

    public function test_admin_can_delete_book(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $book = Book::factory()->create();

        $token = $admin->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->deleteJson("/api/admin/books/{$book->id}");

        $response->assertStatus(204);
        $this->assertDatabaseMissing('books', ['id' => $book->id]);
    }

    public function test_admin_can_filter_books_by_status(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        Book::factory()->count(5)->create(['status' => 'available']);
        Book::factory()->count(3)->create(['status' => 'hidden']);

        $token = $admin->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/admin/books?status=hidden');

        $response->assertOk();
        $this->assertEquals(3, $response->json('meta.total'));
    }

    // ==================== Admin Book Requests ====================

    public function test_admin_can_list_all_book_requests(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        BookRequest::factory()->count(20)->create();

        $token = $admin->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/admin/book-requests');

        $response->assertOk();
        $this->assertEquals(20, $response->json('meta.total'));
    }

    public function test_admin_can_hide_book_request(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $bookRequest = BookRequest::factory()->create(['status' => 'open']);

        $token = $admin->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson("/api/admin/book-requests/{$bookRequest->id}/hide");

        $response->assertOk()
            ->assertJsonPath('data.status', 'hidden');
    }

    public function test_admin_can_delete_book_request(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $bookRequest = BookRequest::factory()->create();

        $token = $admin->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->deleteJson("/api/admin/book-requests/{$bookRequest->id}");

        $response->assertStatus(204);
        $this->assertDatabaseMissing('book_requests', ['id' => $bookRequest->id]);
    }

    // ==================== Admin Notes ====================

    public function test_admin_can_list_all_notes(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        Note::factory()->count(20)->create();

        $token = $admin->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/admin/notes');

        $response->assertOk();
        $this->assertEquals(20, $response->json('meta.total'));
    }

    public function test_admin_can_show_note(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $note = Note::factory()->create();

        $token = $admin->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson("/api/admin/notes/{$note->id}");

        $response->assertOk()
            ->assertJsonPath('data.id', $note->id);
    }

    public function test_admin_can_hide_note(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $note = Note::factory()->create(['visibility' => 'public']);

        $token = $admin->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson("/api/admin/notes/{$note->id}/hide");

        $response->assertOk()
            ->assertJsonPath('data.visibility', 'private');
    }

    public function test_admin_can_delete_note(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $note = Note::factory()->create();

        $token = $admin->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->deleteJson("/api/admin/notes/{$note->id}");

        $response->assertStatus(204);
        $this->assertDatabaseMissing('notes', ['id' => $note->id]);
    }

    // ==================== Admin Classrooms ====================

    public function test_admin_can_list_all_classrooms(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        Classroom::factory()->count(20)->create();

        $token = $admin->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/admin/classrooms');

        $response->assertOk();
        $this->assertEquals(20, $response->json('meta.total'));
    }

    public function test_admin_can_lock_classroom(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $classroom = Classroom::factory()->create(['status' => 'active']);

        $token = $admin->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson("/api/admin/classrooms/{$classroom->id}/lock");

        $response->assertOk()
            ->assertJsonPath('data.status', 'locked');
    }

    public function test_admin_can_delete_classroom(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $classroom = Classroom::factory()->create();

        $token = $admin->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->deleteJson("/api/admin/classrooms/{$classroom->id}");

        $response->assertStatus(204);
        $this->assertDatabaseMissing('classrooms', ['id' => $classroom->id]);
    }

    // ==================== Admin Schools ====================

    public function test_admin_can_list_schools(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        School::factory()->count(20)->create();

        $token = $admin->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/admin/schools');

        $response->assertOk();
        $this->assertEquals(20, $response->json('meta.total'));
    }

    public function test_admin_can_create_school(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $token = $admin->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson('/api/admin/schools', [
                'code' => 'SCH001',
                'name' => 'Liceo Scientifico Test',
                'city' => 'Roma',
                'province' => 'RM',
                'region' => 'Lazio',
                'school_type' => 'lyceum',
            ]);

        $response->assertCreated()
            ->assertJsonPath('data.code', 'SCH001');
    }

    public function test_admin_can_update_school(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $school = School::factory()->create();

        $token = $admin->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->putJson("/api/admin/schools/{$school->id}", [
                'name' => 'Updated School Name',
            ]);

        $response->assertOk()
            ->assertJsonPath('data.name', 'Updated School Name');
    }

    public function test_admin_can_delete_school_without_users(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $school = School::factory()->create();

        $token = $admin->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->deleteJson("/api/admin/schools/{$school->id}");

        $response->assertStatus(204);
    }

    public function test_admin_cannot_delete_school_with_users(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $school = School::factory()->create();
        User::factory()->create(['school_id' => $school->id]);

        $token = $admin->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->deleteJson("/api/admin/schools/{$school->id}");

        $response->assertStatus(409)
            ->assertJsonPath('message', 'Cannot delete school. It has 1 users associated.');
    }

    // ==================== Admin Reports (already tested in ReportTest) ====================

    public function test_admin_can_list_reports_from_admin_endpoint(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        Report::factory()->count(10)->create();

        $token = $admin->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/admin/reports');

        $response->assertOk();
        $this->assertEquals(10, $response->json('meta.total'));
    }

    // ==================== Guest Tests ====================

    public function test_guest_cannot_access_admin_endpoints(): void
    {
        $response = $this->getJson('/api/admin/users');
        $response->assertUnauthorized();

        $response = $this->getJson('/api/admin/books');
        $response->assertUnauthorized();

        $response = $this->getJson('/api/admin/notes');
        $response->assertUnauthorized();
    }
}