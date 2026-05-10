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
        static $counter = 0;
        $counter++;

        // Generate unique section to avoid unique constraint collisions
        // when creating multiple classrooms with same school_id
        // Unique constraint: school_id + academic_year + grade + section + track
        $sections = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
        $sectionIndex = ($counter - 1) % count($sections);
        $sectionSuffix = intdiv($counter - 1, count($sections));
        $section = $sections[$sectionIndex] . ($sectionSuffix > 0 ? $sectionSuffix : '');

        return [
            'school_id' => School::factory(),
            'owner_id' => User::factory(),
            'name' => 'Class ' . fake()->bothify('##?'),
            'grade' => (string) (($counter % 5) + 1),
            'section' => $section,
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

    public function public(): static
    {
        return $this->state(fn (array $attributes) => [
            'visibility' => 'public',
        ]);
    }
}
