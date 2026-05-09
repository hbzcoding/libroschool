<?php

namespace Database\Factories;

use App\Models\Book;
use App\Models\School;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Book>
 */
class BookFactory extends Factory
{
    protected $model = Book::class;

    public function definition(): array
    {
        return [
            'seller_id' => User::factory(),
            'school_id' => School::factory(),
            'title' => fake()->sentence(3),
            'isbn' => fake()->unique()->isbn13(),
            'subject' => fake()->randomElement(['Math', 'Italian', 'English', 'Science', 'History', 'Physics']),
            'grade' => (string) fake()->numberBetween(1, 5),
            'track' => fake()->randomElement(['scientific', 'classical', 'technical', 'professional']),
            'publisher' => fake()->company(),
            'author' => fake()->name(),
            'condition' => fake()->randomElement(['new', 'very_good', 'good', 'acceptable']),
            'price' => fake()->randomFloat(2, 5, 50),
            'description' => fake()->paragraph(),
            'status' => 'available',
        ];
    }

    public function reserved(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'reserved',
        ]);
    }

    public function sold(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'sold',
        ]);
    }
}
