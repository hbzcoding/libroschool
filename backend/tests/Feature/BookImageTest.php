<?php

namespace Tests\Feature;

use App\Models\Book;
use App\Models\School;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class BookImageTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        // Use the 'local' disk for testing instead of R2
        config(['filesystems.book_images_disk' => 'local']);
    }

    public function test_seller_can_upload_image(): void
    {
        Storage::fake('local');

        $user = User::factory()->create(['role' => 'student']);
        $school = School::factory()->create();
        $book = Book::factory()->create([
            'seller_id' => $user->id,
            'school_id' => $school->id,
            'status' => 'available',
        ]);
        $token = $user->createToken('test-token')->plainTextToken;

        $file = UploadedFile::fake()->image('book.jpg', 800, 600);

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson("/api/books/{$book->id}/images", [
                'image' => $file,
            ]);

        $response->assertCreated()
            ->assertJsonStructure([
                'data' => ['id', 'url', 'sort_order'],
            ]);

        $this->assertDatabaseHas('book_images', [
            'book_id' => $book->id,
        ]);
    }

    public function test_non_seller_cannot_upload_image(): void
    {
        $owner = User::factory()->create(['role' => 'student']);
        $otherUser = User::factory()->create(['role' => 'student']);
        $book = Book::factory()->create(['seller_id' => $owner->id]);
        $token = $otherUser->createToken('test-token')->plainTextToken;

        $file = UploadedFile::fake()->image('book.jpg');

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson("/api/books/{$book->id}/images", [
                'image' => $file,
            ]);

        $response->assertForbidden();

        $this->assertDatabaseMissing('book_images', [
            'book_id' => $book->id,
        ]);
    }

    public function test_invalid_file_type_is_rejected(): void
    {
        Storage::fake('local');

        $user = User::factory()->create(['role' => 'student']);
        $book = Book::factory()->create(['seller_id' => $user->id]);
        $token = $user->createToken('test-token')->plainTextToken;

        $file = UploadedFile::fake()->create('document.pdf', 1000, 'application/pdf');

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson("/api/books/{$book->id}/images", [
                'image' => $file,
            ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['image']);

        $this->assertDatabaseMissing('book_images', [
            'book_id' => $book->id,
        ]);
    }

    public function test_oversized_file_is_rejected(): void
    {
        Storage::fake('local');

        $user = User::factory()->create(['role' => 'student']);
        $book = Book::factory()->create(['seller_id' => $user->id]);
        $token = $user->createToken('test-token')->plainTextToken;

        // Create a file larger than 5MB (5120 KB)
        $file = UploadedFile::fake()->image('large.jpg')->size(6000);

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson("/api/books/{$book->id}/images", [
                'image' => $file,
            ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['image']);

        $this->assertDatabaseMissing('book_images', [
            'book_id' => $book->id,
        ]);
    }

    public function test_image_is_stored_in_database(): void
    {
        Storage::fake('local');

        $user = User::factory()->create(['role' => 'student']);
        $book = Book::factory()->create(['seller_id' => $user->id]);
        $token = $user->createToken('test-token')->plainTextToken;

        $file = UploadedFile::fake()->image('book.jpg');

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson("/api/books/{$book->id}/images", [
                'image' => $file,
            ]);

        $response->assertCreated();

        $bookImage = $book->images()->first();

        $this->assertNotNull($bookImage);
        $this->assertNotNull($bookImage->url);
        $this->assertNotNull($bookImage->path);
        $this->assertEquals(0, $bookImage->sort_order);
    }

    public function test_sort_order_is_incremented_for_multiple_images(): void
    {
        Storage::fake('local');

        $user = User::factory()->create(['role' => 'student']);
        $book = Book::factory()->create(['seller_id' => $user->id]);
        $token = $user->createToken('test-token')->plainTextToken;

        // Upload first image
        $file1 = UploadedFile::fake()->image('book1.jpg');
        $response1 = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson("/api/books/{$book->id}/images", ['image' => $file1]);
        $response1->assertCreated();

        // Upload second image
        $file2 = UploadedFile::fake()->image('book2.jpg');
        $response2 = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson("/api/books/{$book->id}/images", ['image' => $file2]);
        $response2->assertCreated();

        $book->refresh();

        $images = $book->images()->orderBy('sort_order')->get();

        $this->assertCount(2, $images);
        $this->assertEquals(0, $images[0]->sort_order);
        $this->assertEquals(1, $images[1]->sort_order);
    }

    public function test_unauthenticated_user_cannot_upload(): void
    {
        $user = User::factory()->create(['role' => 'student']);
        $book = Book::factory()->create(['seller_id' => $user->id]);

        $file = UploadedFile::fake()->image('book.jpg');

        $response = $this->postJson("/api/books/{$book->id}/images", [
            'image' => $file,
        ]);

        $response->assertUnauthorized();
    }

    public function test_valid_file_extensions_are_accepted(): void
    {
        Storage::fake('local');

        $user = User::factory()->create(['role' => 'student']);
        $book = Book::factory()->create(['seller_id' => $user->id]);
        $token = $user->createToken('test-token')->plainTextToken;

        $validExtensions = ['jpg', 'jpeg', 'png', 'webp'];

        foreach ($validExtensions as $ext) {
            $file = UploadedFile::fake()->image("book.{$ext}");

            $response = $this->withHeader('Authorization', "Bearer {$token}")
                ->postJson("/api/books/{$book->id}/images", [
                    'image' => $file,
                ]);

            $response->assertCreated();
        }

        $book->refresh();
        $this->assertCount(4, $book->images);
    }

    public function test_image_is_required(): void
    {
        $user = User::factory()->create(['role' => 'student']);
        $book = Book::factory()->create(['seller_id' => $user->id]);
        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson("/api/books/{$book->id}/images", []);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['image']);
    }

    public function test_uploaded_image_file_is_stored(): void
    {
        Storage::fake('local');

        $user = User::factory()->create(['role' => 'student']);
        $book = Book::factory()->create(['seller_id' => $user->id]);
        $token = $user->createToken('test-token')->plainTextToken;

        $file = UploadedFile::fake()->image('book.jpg');

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson("/api/books/{$book->id}/images", [
                'image' => $file,
            ]);

        $response->assertCreated();

        $bookImage = $book->images()->first();

        // Verify the file was stored
        Storage::disk('local')->assertExists($bookImage->path);
    }
}
