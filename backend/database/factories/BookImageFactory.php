<?php

namespace Database\Factories;

use App\Models\Book;
use App\Models\BookImage;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<BookImage>
 */
class BookImageFactory extends Factory
{
    protected $model = BookImage::class;

    public function definition(): array
    {
        return [
            'book_id' => Book::factory(),
            'url' => fake()->imageUrl(),
            'path' => 'books/1/' . fake()->uuid() . '.jpg',
            'sort_order' => 0,
        ];
    }
}
