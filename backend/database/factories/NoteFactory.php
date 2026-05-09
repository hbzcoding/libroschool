<?php

namespace Database\Factories;

use App\Models\Note;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Note>
 */
class NoteFactory extends Factory
{
    protected $model = Note::class;

    public function definition(): array
    {
        return [
            'author_id' => User::factory(),
            'school_id' => null,
            'classroom_id' => null,
            'title' => fake()->sentence(4),
            'subject' => fake()->randomElement(['Math', 'Italian', 'English', 'Science', 'History', 'Physics']),
            'grade' => (string) fake()->numberBetween(1, 5),
            'content' => fake()->paragraphs(3, true),
            'visibility' => 'private',
            'mode' => 'normal',
        ];
    }

    public function public(): static
    {
        return $this->state(fn (array $attributes) => [
            'visibility' => 'public',
        ]);
    }

    public function flashcard(): static
    {
        return $this->state(fn (array $attributes) => [
            'mode' => 'flashcard',
        ]);
    }
}
