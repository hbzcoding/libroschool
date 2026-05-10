<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\BookRequestResource;
use App\Models\BookRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminBookRequestController extends Controller
{
    /**
     * List all book requests with pagination and filters (admin only).
     */
    public function index(Request $request): JsonResponse
    {
        $request->user()->authorizeAdmin();

        $query = BookRequest::query()->with(['buyer', 'school']);

        // Filter by status
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Filter by school_id
        if ($request->filled('school_id')) {
            $query->where('school_id', $request->school_id);
        }

        // Filter by buyer_id
        if ($request->filled('buyer_id')) {
            $query->where('buyer_id', $request->buyer_id);
        }

        // Search by title or isbn
        if ($request->filled('search')) {
            $search = strtolower($request->search);
            $query->where(function ($q) use ($search) {
                $q->whereRaw('LOWER(title) LIKE ?', ["%{$search}%"])
                    ->orWhereRaw('LOWER(isbn) LIKE ?', ["%{$search}%"]);
            });
        }

        $requests = $query->orderBy('created_at', 'desc')->paginate(15);

        return response()->json([
            'data' => BookRequestResource::collection($requests->items()),
            'meta' => [
                'current_page' => $requests->currentPage(),
                'last_page' => $requests->lastPage(),
                'per_page' => $requests->perPage(),
                'total' => $requests->total(),
            ],
        ]);
    }

    /**
     * Show a specific book request (admin only).
     */
    public function show(Request $request, BookRequest $bookRequest): JsonResponse
    {
        $request->user()->authorizeAdmin();

        $bookRequest->load(['buyer', 'school']);

        return response()->json([
            'data' => new BookRequestResource($bookRequest),
        ]);
    }

    /**
     * Hide a book request (admin only).
     */
    public function hide(Request $request, BookRequest $bookRequest): JsonResponse
    {
        $request->user()->authorizeAdmin();

        $bookRequest->update(['status' => 'hidden']);

        $bookRequest->load(['buyer', 'school']);

        return response()->json([
            'data' => new BookRequestResource($bookRequest),
        ]);
    }

    /**
     * Delete a book request (admin only).
     */
    public function destroy(Request $request, BookRequest $bookRequest): JsonResponse
    {
        $request->user()->authorizeAdmin();

        $bookRequest->delete();

        return response()->json(null, 204);
    }
}
