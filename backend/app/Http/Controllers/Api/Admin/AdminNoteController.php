<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\NoteResource;
use App\Models\Note;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminNoteController extends Controller
{
    /**
     * List all notes with pagination and filters (admin only).
     */
    public function index(Request $request): JsonResponse
    {
        $request->user()->authorizeAdmin();

        $query = Note::query()->with(['author', 'school', 'classroom']);

        // Filter by visibility
        if ($request->filled('visibility')) {
            $query->where('visibility', $request->visibility);
        }

        // Filter by mode
        if ($request->filled('mode')) {
            $query->where('mode', $request->mode);
        }

        // Filter by author_id
        if ($request->filled('author_id')) {
            $query->where('author_id', $request->author_id);
        }

        // Filter by school_id
        if ($request->filled('school_id')) {
            $query->where('school_id', $request->school_id);
        }

        // Filter by classroom_id
        if ($request->filled('classroom_id')) {
            $query->where('classroom_id', $request->classroom_id);
        }

        // Search by title or content
        if ($request->filled('search')) {
            $search = strtolower($request->search);
            $query->where(function ($q) use ($search) {
                $q->whereRaw('LOWER(title) LIKE ?', ["%{$search}%"])
                    ->orWhereRaw('LOWER(content) LIKE ?', ["%{$search}%"]);
            });
        }

        $notes = $query->orderBy('created_at', 'desc')->paginate(15);

        return response()->json([
            'data' => NoteResource::collection($notes->items()),
            'meta' => [
                'current_page' => $notes->currentPage(),
                'last_page' => $notes->lastPage(),
                'per_page' => $notes->perPage(),
                'total' => $notes->total(),
            ],
        ]);
    }

    /**
     * Show a specific note (admin only).
     */
    public function show(Request $request, Note $note): JsonResponse
    {
        $request->user()->authorizeAdmin();

        $note->load(['author', 'school', 'classroom']);

        if ($note->visibility === 'specific_users') {
            $note->load(['permissions.user']);
        }

        return response()->json([
            'data' => new NoteResource($note),
        ]);
    }

    /**
     * Hide a note (admin only).
     */
    public function hide(Request $request, Note $note): JsonResponse
    {
        $request->user()->authorizeAdmin();

        $note->update(['visibility' => 'private']);

        $note->load(['author', 'school', 'classroom']);

        return response()->json([
            'data' => new NoteResource($note),
        ]);
    }

    /**
     * Delete a note (admin only).
     */
    public function destroy(Request $request, Note $note): JsonResponse
    {
        $request->user()->authorizeAdmin();

        $note->delete();

        return response()->json(null, 204);
    }
}