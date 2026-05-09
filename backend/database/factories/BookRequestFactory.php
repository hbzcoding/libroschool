<?php

namespace Database\Factories;

use App\Models\BookRequest;
use App\Models\School;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<BookRequest>
 */
class BookRequestFactory extends Factory
{
    protected $model = BookRequest::class;

    public function definition(): array
    {
        return [
            'buyer_id' => User::factory(),
            'school_id' => School::factory(),
            'title' => fake()->sentence(3),
            'isbn' => fake()->optional()->isbn13(),
            'subject' => fake()->randomElement(['Math', 'Italian', 'English', 'Science', 'History', 'Physics']),
            'grade' => (string) fake()->numberBetween(1, 5),
            'track' => fake()->randomElement(['scientific', 'classical', 'technical', 'professional']),
            'max_price' => fake()->optional()->randomFloat(2, 5, 50),
            'description' => fake()->optional()->paragraph(),
            'status' => 'open',
        ];
    }

    public function matched(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'matched',
        ]);
    }

    public function closed(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'closed',
        ]);
    }
}
