<?php

namespace Database\Factories;

use App\Models\Report;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Report>
 */
class ReportFactory extends Factory
{
    protected $model = Report::class;

    public function definition(): array
    {
        return [
            'reporter_id' => User::factory(),
            'target_type' => fake()->randomElement(['Book', 'BookRequest', 'Note', 'Classroom', 'User']),
            'target_id' => fake()->numberBetween(1, 100),
            'reason' => fake()->paragraph(),
            'status' => 'open',
        ];
    }

    public function reviewed(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'reviewed',
        ]);
    }

    public function dismissed(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'dismissed',
        ]);
    }
}
