<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\BookResource;
use App\Models\Book;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminBookController extends Controller
{
    /**
     * List all books with pagination and filters (admin only).
     */
    public function index(Request $request): JsonResponse
    {
        $request->user()->authorizeAdmin();

        $query = Book::query()->with(['seller', 'school', 'images']);

        // Filter by status
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Filter by school_id
        if ($request->filled('school_id')) {
            $query->where('school_id', $request->school_id);
        }

        // Filter by seller_id
        if ($request->filled('seller_id')) {
            $query->where('seller_id', $request->seller_id);
        }

        // Filter by condition
        if ($request->filled('condition')) {
            $query->where('condition', $request->condition);
        }

        // Search by title or isbn
        if ($request->filled('search')) {
            $search = strtolower($request->search);
            $query->where(function ($q) use ($search) {
                $q->whereRaw('LOWER(title) LIKE ?', ["%{$search}%"])
                    ->orWhereRaw('LOWER(isbn) LIKE ?', ["%{$search}%"]);
            });
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
     * Show a specific book (admin only).
     */
    public function show(Request $request, Book $book): JsonResponse
    {
        $request->user()->authorizeAdmin();

        $book->load(['seller', 'school', 'images']);

        return response()->json([
            'data' => new BookResource($book),
        ]);
    }

    /**
     * Hide a book (admin only).
     */
    public function hide(Request $request, Book $book): JsonResponse
    {
        $request->user()->authorizeAdmin();

        $book->update(['status' => 'hidden']);

        $book->load(['seller', 'school', 'images']);

        return response()->json([
            'data' => new BookResource($book),
        ]);
    }

    /**
     * Delete a book (admin only).
     */
    public function destroy(Request $request, Book $book): JsonResponse
    {
        $request->user()->authorizeAdmin();

        $book->delete();

        return response()->json(null, 204);
    }
}
