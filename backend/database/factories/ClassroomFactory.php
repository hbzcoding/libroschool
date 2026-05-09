<?php

namespace Database\Factories;

use App\Models\Classroom;
use App\Models\School;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Classroom>
 */
class ClassroomFactory extends Factory
{
    protected $model = Classroom::class;

    public function definition(): array
    {
        return [
            'school_id' => School::factory(),
            'owner_id' => User::factory(),
            'name' => 'Class ' . fake()->bothify('##?'),
            'grade' => (string) fake()->numberBetween(1, 5),
            'section' => fake()->letter(),
            'track' => fake()->randomElement(['scientific', 'classical', 'technical', 'professional']),
            'academic_year' => '2024-2025',
            'join_code' => fake()->unique()->bothify('????##'),
            'join_policy' => 'code',
            'visibility' => 'private',
            'is_verified' => false,
            'status' => 'active',
        ];
    }

    public function verified(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_verified' => true,
        ]);
    }
}
