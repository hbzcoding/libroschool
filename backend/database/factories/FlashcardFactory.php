<?php

namespace Database\Factories;

use App\Models\Flashcard;
use App\Models\Note;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Flashcard>
 */
class FlashcardFactory extends Factory
{
    protected $model = Flashcard::class;

    public function definition(): array
    {
        return [
            'note_id' => Note::factory(),
            'front' => fake()->sentence(4),
            'back' => fake()->sentence(6),
            'sort_order' => 0,
        ];
    }

    public function forNote(Note $note): static
    {
        return $this->state(fn (array $attributes) => [
            'note_id' => $note->id,
        ]);
    }
}
