<?php

namespace App\Services;

use App\Models\Book;
use App\Models\BookImage;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class BookImageService
{
    /**
     * Upload a book image to R2 and create a database record.
     */
    public function upload(Book $book, UploadedFile $file): BookImage
    {
        $disk = config('filesystems.book_images_disk', 'r2');

        // Generate a unique path to avoid filename conflicts
        $path = sprintf(
            'books/%s/%s.%s',
            $book->id,
            Str::uuid()->toString(),
            $file->getClientOriginalExtension()
        );

        // Upload to storage
        Storage::disk($disk)->put($path, $file->getContent(), 'public');

        // Generate the URL
        $url = Storage::disk($disk)->url($path);

        // Determine sort_order based on existing images count
        $sortOrder = $book->images()->count();

        // Create the book_images record
        $bookImage = $book->images()->create([
            'url' => $url,
            'path' => $path,
            'sort_order' => $sortOrder,
        ]);

        return $bookImage->fresh();
    }

    /**
     * Delete a book image from R2 and the database.
     */
    public function delete(BookImage $bookImage): void
    {
        $disk = config('filesystems.book_images_disk', 'r2');

        Storage::disk($disk)->delete($bookImage->path);

        $bookImage->delete();
    }
}
