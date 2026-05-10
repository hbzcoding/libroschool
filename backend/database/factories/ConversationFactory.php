<?php

namespace Database\Factories;

use App\Models\Book;
use App\Models\BookRequest;
use App\Models\Conversation;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Conversation>
 */
class ConversationFactory extends Factory
{
    protected $model = Conversation::class;

    public function definition(): array
    {
        return [
            'book_id' => null,
            'book_request_id' => null,
        ];
    }

    public function forBook(Book $book): static
    {
        return $this->state(fn (array $attributes) => [
            'book_id' => $book->id,
        ]);
    }

    public function forBookRequest(BookRequest $bookRequest): static
    {
        return $this->state(fn (array $attributes) => [
            'book_request_id' => $bookRequest->id,
        ]);
    }
}