<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreBookRequestRequest;
use App\Http\Requests\UpdateBookRequestRequest;
use App\Http\Resources\BookRequestResource;
use App\Models\BookRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BookRequestController extends Controller
{
    /**
     * List book requests with pagination and filters.
     */
    public function index(Request $request): JsonResponse
    {
        $query = BookRequest::query()
            ->with(['buyer', 'school']);

        // Default status filter: open (unless explicitly provided)
        if (!$request->has('status')) {
            $query->where('status', 'open');
        }

        // Search in title, isbn, subject
        if ($request->filled('search')) {
            $search = strtolower($request->search);
            $query->where(function ($q) use ($search) {
                $q->whereRaw('LOWER(title) LIKE ?', ["%{$search}%"])
                    ->orWhereRaw('LOWER(isbn) LIKE ?', ["%{$search}%"])
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

        // Filter by max_price
        if ($request->filled('max_price')) {
            $query->where('max_price', '<=', $request->max_price);
        }

        // Filter by status
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $bookRequests = $query->orderBy('created_at', 'desc')->paginate(15);

        return response()->json([
            'data' => BookRequestResource::collection($bookRequests->items()),
            'meta' => [
                'current_page' => $bookRequests->currentPage(),
                'last_page' => $bookRequests->lastPage(),
                'per_page' => $bookRequests->perPage(),
                'total' => $bookRequests->total(),
            ],
        ]);
    }

    /**
     * Show a specific book request.
     */
    public function show(BookRequest $bookRequest): JsonResponse
    {
        $bookRequest->load(['buyer', 'school']);

        return response()->json([
            'data' => new BookRequestResource($bookRequest),
        ]);
    }

    /**
     * Create a new book request.
     */
    public function store(StoreBookRequestRequest $request): JsonResponse
    {
        $this->authorize('create', BookRequest::class);

        $bookRequest = BookRequest::create([
            'buyer_id' => $request->user()->id,
            'school_id' => $request->school_id,
            'title' => $request->title,
            'isbn' => $request->isbn,
            'subject' => $request->subject,
            'grade' => $request->grade,
            'track' => $request->track,
            'max_price' => $request->max_price,
            'description' => $request->description,
            'status' => $request->status ?? 'open',
        ]);

        $bookRequest->load(['buyer', 'school']);

        return response()->json([
            'data' => new BookRequestResource($bookRequest),
        ], 201);
    }

    /**
     * Update a book request.
     */
    public function update(UpdateBookRequestRequest $request, BookRequest $bookRequest): JsonResponse
    {
        $this->authorize('update', $bookRequest);

        $bookRequest->update($request->validated());

        $bookRequest->load(['buyer', 'school']);

        return response()->json([
            'data' => new BookRequestResource($bookRequest),
        ]);
    }

    /**
     * Delete a book request.
     */
    public function destroy(BookRequest $bookRequest): JsonResponse
    {
        $this->authorize('delete', $bookRequest);

        $bookRequest->delete();

        return response()->json(null, 204);
    }

    /**
     * Close a book request.
     */
    public function close(BookRequest $bookRequest): JsonResponse
    {
        $this->authorize('close', $bookRequest);

        $bookRequest->update(['status' => 'closed']);

        $bookRequest->load(['buyer', 'school']);

        return response()->json([
            'data' => new BookRequestResource($bookRequest),
        ]);
    }
}
