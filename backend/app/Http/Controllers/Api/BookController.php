<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreBookRequest;
use App\Http\Requests\UpdateBookRequest;
use App\Http\Requests\UploadBookImageRequest;
use App\Http\Resources\BookImageResource;
use App\Http\Resources\BookResource;
use App\Models\Book;
use App\Services\BookImageService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BookController extends Controller
{
    /**
     * List books with pagination and filters.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Book::query()
            ->with(['seller', 'school']);

        // Default status filter: available (unless explicitly provided)
        if (!$request->has('status')) {
            $query->where('status', 'available');
        }

        // Search in title, isbn, author, subject
        if ($request->filled('search')) {
            $search = strtolower($request->search);
            $query->where(function ($q) use ($search) {
                $q->whereRaw('LOWER(title) LIKE ?', ["%{$search}%"])
                    ->orWhereRaw('LOWER(isbn) LIKE ?', ["%{$search}%"])
                    ->orWhereRaw('LOWER(author) LIKE ?', ["%{$search}%"])
                    ->orWhereRaw('LOWER(subject) LIKE ?', ["%{$search}%"]);
            });
        }

        // Filter by school_id
        if ($request->filled('school_id')) {
            $query->where('school_id', $request->school_id);
        }

        // Filter by grade
        if ($request->filled('grade')) {
            $query->where('grade', $request->grade);
        }

        // Filter by track
        if ($request->filled('track')) {
            $track = strtolower($request->track);
            $query->whereRaw('LOWER(track) LIKE ?', ["%{$track}%"]);
        }

        // Filter by subject
        if ($request->filled('subject')) {
            $subject = strtolower($request->subject);
            $query->whereRaw('LOWER(subject) LIKE ?', ["%{$subject}%"]);
        }

        // Filter by isbn
        if ($request->filled('isbn')) {
            $query->where('isbn', $request->isbn);
        }

        // Filter by min_price
        if ($request->filled('min_price')) {
            $query->where('price', '>=', $request->min_price);
        }

        // Filter by max_price
        if ($request->filled('max_price')) {
            $query->where('price', '<=', $request->max_price);
        }

        // Filter by condition
        if ($request->filled('condition')) {
            $query->where('condition', $request->condition);
        }

        // Filter by status
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $books = $query->orderBy('created_at', 'desc')->paginate(15);

        return response()->json([
            'data' => BookResource::collection($books->items()),
            'meta' => [
                'current_page' => $books->currentPage(),
                'last_page' => $books->lastPage(),
                'per_page' => $books->perPage(),
                'total' => $books->total(),
            ],
        ]);
    }

    /**
     * Show a specific book.
     */
    public function show(Book $book): JsonResponse
    {
        $book->load(['seller', 'school', 'images']);

        return response()->json([
            'data' => new BookResource($book),
        ]);
    }

    /**
     * Create a new book listing.
     */
    public function store(StoreBookRequest $request): JsonResponse
    {
        $this->authorize('create', Book::class);

        $book = Book::create([
            'seller_id' => $request->user()->id,
            'school_id' => $request->school_id,
            'title' => $request->title,
            'isbn' => $request->isbn,
            'subject' => $request->subject,
            'grade' => $request->grade,
            'track' => $request->track,
            'publisher' => $request->publisher,
            'author' => $request->author,
            'condition' => $request->condition,
            'price' => $request->price,
            'description' => $request->description,
            'status' => $request->status ?? 'available',
        ]);

        $book->load(['seller', 'school']);

        return response()->json([
            'data' => new BookResource($book),
        ], 201);
    }

    /**
     * Update a book listing.
     */
    public function update(UpdateBookRequest $request, Book $book): JsonResponse
    {
        $this->authorize('update', $book);

        $book->update($request->validated());

        $book->load(['seller', 'school', 'images']);

        return response()->json([
            'data' => new BookResource($book),
        ]);
    }

    /**
     * Delete a book listing.
     */
    public function destroy(Book $book): JsonResponse
    {
        $this->authorize('delete', $book);

        $book->delete();

        return response()->json(null, 204);
    }

    /**
     * Mark a book as reserved.
     */
    public function markReserved(Book $book): JsonResponse
    {
        $this->authorize('markReserved', $book);

        $book->update(['status' => 'reserved']);

        $book->load(['seller', 'school', 'images']);

        return response()->json([
            'data' => new BookResource($book),
        ]);
    }

    /**
     * Mark a book as sold.
     */
    public function markSold(Book $book): JsonResponse
    {
        $this->authorize('markSold', $book);

        $book->update(['status' => 'sold']);

        $book->load(['seller', 'school', 'images']);

        return response()->json([
            'data' => new BookResource($book),
        ]);
    }

    /**
     * Upload an image for a book.
     */
    public function uploadImage(UploadBookImageRequest $request, Book $book, BookImageService $service): JsonResponse
    {
        $this->authorize('uploadImage', $book);

        $image = $service->upload($book, $request->file('image'));

        return response()->json([
            'data' => new BookImageResource($image),
        ], 201);
    }
}
