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

class ReportTest extends TestCase
{
    use RefreshDatabase;

    // ==================== User Reports ====================

    public function test_authenticated_user_can_create_report(): void
    {
        $user = User::factory()->create(['role' => 'student']);
        $book = Book::factory()->create();
        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson('/api/reports', [
                'target_type' => 'Book',
                'target_id' => $book->id,
                'reason' => 'This listing contains inappropriate content.',
            ]);

        $response->assertCreated()
            ->assertJsonStructure([
                'data' => ['id', 'reporter', 'target_type', 'target_id', 'reason', 'status', 'created_at', 'updated_at'],
            ])
            ->assertJsonPath('data.target_type', 'Book')
            ->assertJsonPath('data.target_id', $book->id)
            ->assertJsonPath('data.status', 'open');

        $this->assertDatabaseHas('reports', [
            'reporter_id' => $user->id,
            'target_type' => 'Book',
            'target_id' => $book->id,
            'status' => 'open',
        ]);
    }

    public function test_guest_cannot_create_report(): void
    {
        $book = Book::factory()->create();

        $response = $this->postJson('/api/reports', [
            'target_type' => 'Book',
            'target_id' => $book->id,
            'reason' => 'Test reason',
        ]);

        $response->assertUnauthorized();
    }

    public function test_create_report_validates_required_fields(): void
    {
        $user = User::factory()->create(['role' => 'student']);
        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson('/api/reports', []);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['target_type', 'target_id', 'reason']);
    }

    public function test_create_report_validates_target_type(): void
    {
        $user = User::factory()->create(['role' => 'student']);
        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson('/api/reports', [
                'target_type' => 'InvalidType',
                'target_id' => 1,
                'reason' => 'Test reason',
            ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['target_type']);
    }

    public function test_create_report_validates_target_exists(): void
    {
        $user = User::factory()->create(['role' => 'student']);
        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson('/api/reports', [
                'target_type' => 'Book',
                'target_id' => 99999,
                'reason' => 'Test reason',
            ]);

        $response->assertStatus(404)
            ->assertJsonPath('message', 'The specified target does not exist.');
    }

    public function test_user_cannot_report_same_target_twice_while_open(): void
    {
        $user = User::factory()->create(['role' => 'student']);
        $book = Book::factory()->create();
        $token = $user->createToken('test-token')->plainTextToken;

        // First report
        $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson('/api/reports', [
                'target_type' => 'Book',
                'target_id' => $book->id,
                'reason' => 'First report',
            ])->assertCreated();

        // Second report on same target
        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson('/api/reports', [
                'target_type' => 'Book',
                'target_id' => $book->id,
                'reason' => 'Second report',
            ]);

        $response->assertStatus(409)
            ->assertJsonPath('message', 'You have already reported this content.');
    }

    public function test_user_can_report_different_targets(): void
    {
        $user = User::factory()->create(['role' => 'student']);
        $book1 = Book::factory()->create();
        $book2 = Book::factory()->create();
        $token = $user->createToken('test-token')->plainTextToken;

        $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson('/api/reports', [
                'target_type' => 'Book',
                'target_id' => $book1->id,
                'reason' => 'First report',
            ])->assertCreated();

        $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson('/api/reports', [
                'target_type' => 'Book',
                'target_id' => $book2->id,
                'reason' => 'Second report',
            ])->assertCreated();

        $this->assertEquals(2, Report::where('reporter_id', $user->id)->count());
    }

    public function test_can_report_book(): void
    {
        $user = User::factory()->create(['role' => 'student']);
        $book = Book::factory()->create();
        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson('/api/reports', [
                'target_type' => 'Book',
                'target_id' => $book->id,
                'reason' => 'Inappropriate book listing',
            ]);

        $response->assertCreated();
    }

    public function test_can_report_book_request(): void
    {
        $user = User::factory()->create(['role' => 'student']);
        $bookRequest = BookRequest::factory()->create();
        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson('/api/reports', [
                'target_type' => 'BookRequest',
                'target_id' => $bookRequest->id,
                'reason' => 'Spam request',
            ]);

        $response->assertCreated();
    }

    public function test_can_report_note(): void
    {
        $user = User::factory()->create(['role' => 'student']);
        $note = Note::factory()->create(['visibility' => 'public']);
        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson('/api/reports', [
                'target_type' => 'Note',
                'target_id' => $note->id,
                'reason' => 'Offensive content in note',
            ]);

        $response->assertCreated();
    }

    public function test_can_report_classroom(): void
    {
        $user = User::factory()->create(['role' => 'student']);
        $classroom = Classroom::factory()->create(['visibility' => 'public']);
        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson('/api/reports', [
                'target_type' => 'Classroom',
                'target_id' => $classroom->id,
                'reason' => 'Inappropriate classroom content',
            ]);

        $response->assertCreated();
    }

    public function test_can_report_user(): void
    {
        $user = User::factory()->create(['role' => 'student']);
        $targetUser = User::factory()->create();
        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson('/api/reports', [
                'target_type' => 'User',
                'target_id' => $targetUser->id,
                'reason' => 'Harassment behavior',
            ]);

        $response->assertCreated();
    }

    // ==================== Admin Reports ====================

    public function test_admin_can_list_reports(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        Report::factory()->count(20)->create();

        $token = $admin->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/admin/reports');

        $response->assertOk()
            ->assertJsonStructure([
                'data' => [
                    '*' => ['id', 'reporter', 'target_type', 'target_id', 'reason', 'status', 'created_at', 'updated_at'],
                ],
                'meta' => ['current_page', 'last_page', 'per_page', 'total'],
            ]);

        $this->assertCount(15, $response->json('data'));
        $this->assertEquals(20, $response->json('meta.total'));
    }

    public function test_non_admin_cannot_list_reports(): void
    {
        $user = User::factory()->create(['role' => 'student']);
        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/admin/reports');

        $response->assertForbidden();
    }

    public function test_guest_cannot_list_reports(): void
    {
        $response = $this->getJson('/api/admin/reports');

        $response->assertUnauthorized();
    }

    public function test_admin_can_filter_reports_by_status(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        Report::factory()->count(5)->create(['status' => 'open']);
        Report::factory()->count(3)->reviewed()->create();
        Report::factory()->count(2)->dismissed()->create();

        $token = $admin->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/admin/reports?status=open');

        $response->assertOk();
        $this->assertEquals(5, $response->json('meta.total'));

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/admin/reports?status=reviewed');

        $response->assertOk();
        $this->assertEquals(3, $response->json('meta.total'));
    }

    public function test_admin_can_filter_reports_by_target_type(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        Report::factory()->count(4)->create(['target_type' => 'Book']);
        Report::factory()->count(2)->create(['target_type' => 'Note']);

        $token = $admin->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/admin/reports?target_type=Book');

        $response->assertOk();
        $this->assertEquals(4, $response->json('meta.total'));
    }

    public function test_admin_can_filter_reports_by_target_id(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        Report::factory()->count(3)->create(['target_type' => 'Book', 'target_id' => 1]);
        Report::factory()->count(2)->create(['target_type' => 'Book', 'target_id' => 2]);

        $token = $admin->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/admin/reports?target_id=1');

        $response->assertOk();
        $this->assertEquals(3, $response->json('meta.total'));
    }

    public function test_admin_can_filter_reports_by_reporter_id(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $reporter = User::factory()->create();
        Report::factory()->count(4)->create(['reporter_id' => $reporter->id]);
        Report::factory()->count(3)->create();

        $token = $admin->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson("/api/admin/reports?reporter_id={$reporter->id}");

        $response->assertOk();
        $this->assertEquals(4, $response->json('meta.total'));
    }

    public function test_admin_can_show_report(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $report = Report::factory()->create();

        $token = $admin->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson("/api/admin/reports/{$report->id}");

        $response->assertOk()
            ->assertJsonPath('data.id', $report->id)
            ->assertJsonPath('data.target_type', $report->target_type)
            ->assertJsonPath('data.reason', $report->reason);
    }

    public function test_non_admin_cannot_show_report(): void
    {
        $user = User::factory()->create(['role' => 'student']);
        $report = Report::factory()->create();
        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson("/api/admin/reports/{$report->id}");

        $response->assertForbidden();
    }

    public function test_admin_can_resolve_report_as_reviewed(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $report = Report::factory()->create(['status' => 'open']);
        $token = $admin->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson("/api/admin/reports/{$report->id}/resolve", [
                'status' => 'reviewed',
            ]);

        $response->assertOk()
            ->assertJsonPath('data.status', 'reviewed');

        $this->assertDatabaseHas('reports', [
            'id' => $report->id,
            'status' => 'reviewed',
        ]);
    }

    public function test_admin_can_resolve_report_as_dismissed(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $report = Report::factory()->create(['status' => 'open']);
        $token = $admin->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson("/api/admin/reports/{$report->id}/resolve", [
                'status' => 'dismissed',
            ]);

        $response->assertOk()
            ->assertJsonPath('data.status', 'dismissed');

        $this->assertDatabaseHas('reports', [
            'id' => $report->id,
            'status' => 'dismissed',
        ]);
    }

    public function test_admin_cannot_resolve_already_resolved_report(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $report = Report::factory()->reviewed()->create();
        $token = $admin->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson("/api/admin/reports/{$report->id}/resolve", [
                'status' => 'reviewed',
            ]);

        $response->assertStatus(409)
            ->assertJsonPath('message', 'This report has already been resolved.');
    }

    public function test_non_admin_cannot_resolve_report(): void
    {
        $user = User::factory()->create(['role' => 'student']);
        $report = Report::factory()->create(['status' => 'open']);
        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson("/api/admin/reports/{$report->id}/resolve", [
                'status' => 'reviewed',
            ]);

        $response->assertForbidden();
    }

    public function test_resolve_report_validates_status(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $report = Report::factory()->create(['status' => 'open']);
        $token = $admin->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson("/api/admin/reports/{$report->id}/resolve", [
                'status' => 'invalid_status',
            ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['status']);
    }

    public function test_reports_are_ordered_by_created_at_desc(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $token = $admin->createToken('test-token')->plainTextToken;

        $report1 = Report::factory()->create(['created_at' => now()->subDays(2)]);
        $report2 = Report::factory()->create(['created_at' => now()->subDays(1)]);
        $report3 = Report::factory()->create(['created_at' => now()]);

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/admin/reports');

        $response->assertOk();
        $ids = array_column($response->json('data'), 'id');
        $this->assertEquals([$report3->id, $report2->id, $report1->id], $ids);
    }

    public function test_report_includes_reporter_data(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $reporter = User::factory()->create(['name' => 'Test Reporter']);
        $report = Report::factory()->create(['reporter_id' => $reporter->id]);
        $token = $admin->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson("/api/admin/reports/{$report->id}");

        $response->assertOk()
            ->assertJsonPath('data.reporter.id', $reporter->id)
            ->assertJsonPath('data.reporter.name', 'Test Reporter');
    }
}
