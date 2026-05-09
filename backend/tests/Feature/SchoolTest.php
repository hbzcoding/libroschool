<?php

namespace Tests\Feature;

use App\Models\School;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SchoolTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_list_schools(): void
    {
        School::factory()->count(20)->create();

        $response = $this->getJson('/api/schools');

        $response->assertOk()
            ->assertJsonStructure([
                'data' => [
                    '*' => ['id', 'code', 'name', 'city', 'province', 'region', 'country', 'school_type'],
                ],
                'meta' => ['current_page', 'last_page', 'per_page', 'total'],
            ]);

        // Default pagination is 15
        $this->assertCount(15, $response->json('data'));
        $this->assertEquals(20, $response->json('meta.total'));
        $this->assertEquals(15, $response->json('meta.per_page'));
    }

    public function test_user_can_search_schools(): void
    {
        School::factory()->create(['name' => 'Liceo Scientifico Galileo']);
        School::factory()->create(['name' => 'Istituto Tecnico Fermi']);
        School::factory()->create(['name' => 'Liceo Classico Virgilio']);

        $response = $this->getJson('/api/schools?search=Galileo');

        $response->assertOk();
        $this->assertCount(1, $response->json('data'));
        $this->assertEquals('Liceo Scientifico Galileo', $response->json('data.0.name'));
    }

    public function test_user_can_filter_schools_by_city(): void
    {
        School::factory()->create(['city' => 'Milano']);
        School::factory()->create(['city' => 'Roma']);
        School::factory()->create(['city' => 'Milano']);

        $response = $this->getJson('/api/schools?city=Milano');

        $response->assertOk();
        $this->assertCount(2, $response->json('data'));
    }

    public function test_user_can_filter_schools_by_school_type(): void
    {
        School::factory()->create(['school_type' => 'lyceum']);
        School::factory()->create(['school_type' => 'technical']);
        School::factory()->create(['school_type' => 'lyceum']);

        $response = $this->getJson('/api/schools?school_type=lyceum');

        $response->assertOk();
        $this->assertCount(2, $response->json('data'));
    }

    public function test_user_can_show_school(): void
    {
        $school = School::factory()->create();

        $response = $this->getJson("/api/schools/{$school->id}");

        $response->assertOk()
            ->assertJsonPath('data.id', $school->id)
            ->assertJsonPath('data.name', $school->name);
    }

    public function test_non_admin_cannot_create_school(): void
    {
        $user = User::factory()->create(['role' => 'student']);
        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson('/api/schools', [
                'code' => 'SCH0001',
                'name' => 'Test School',
                'city' => 'Roma',
                'province' => 'RM',
                'region' => 'Lazio',
                'school_type' => 'lyceum',
            ]);

        $response->assertForbidden();
    }

    public function test_admin_can_create_school(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $token = $admin->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson('/api/schools', [
                'code' => 'SCH0001',
                'name' => 'Liceo Scientifico Test',
                'city' => 'Roma',
                'province' => 'RM',
                'region' => 'Lazio',
                'country' => 'Italy',
                'school_type' => 'lyceum',
            ]);

        $response->assertCreated()
            ->assertJsonPath('data.code', 'SCH0001')
            ->assertJsonPath('data.name', 'Liceo Scientifico Test');

        $this->assertDatabaseHas('schools', [
            'code' => 'SCH0001',
            'name' => 'Liceo Scientifico Test',
        ]);
    }

    public function test_create_school_validates_required_fields(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $token = $admin->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson('/api/schools', []);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['code', 'name', 'city', 'province', 'region', 'school_type']);
    }

    public function test_schools_are_ordered_by_name(): void
    {
        School::factory()->create(['name' => 'Zeta School']);
        School::factory()->create(['name' => 'Alpha School']);
        School::factory()->create(['name' => 'Beta School']);

        $response = $this->getJson('/api/schools');

        $names = array_column($response->json('data'), 'name');
        $sorted = $names;
        sort($sorted);
        $this->assertEquals($sorted, $names);
    }

    public function test_search_by_code(): void
    {
        School::factory()->create(['code' => 'RM1234', 'name' => 'School One']);
        School::factory()->create(['code' => 'MI5678', 'name' => 'School Two']);

        $response = $this->getJson('/api/schools?search=RM1234');

        $response->assertOk();
        $this->assertCount(1, $response->json('data'));
        $this->assertEquals('RM1234', $response->json('data.0.code'));
    }
}
