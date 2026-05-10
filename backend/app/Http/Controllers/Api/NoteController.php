<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\GrantNotePermissionRequest;
use App\Http\Requests\StoreNoteRequest;
use App\Http\Requests\UpdateNoteRequest;
use App\Http\Resources\NotePermissionResource;
use App\Http\Resources\NoteResource;
use App\Models\ClassroomMember;
use App\Models\Note;
use App\Models\User;
use App\Services\NoteService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NoteController extends Controller
{
    private NoteService $service;

    public function __construct(NoteService $service)
    {
        $this->service = $service;
    }

    /**
     * List notes visible to current user with pagination and filters.
     */
    public function index(Request $request): JsonResponse
    {
        $user = auth()->user();
        $query = Note::query()
            ->with(['author', 'school', 'classroom']);

        // Apply visibility rules
        $query->where(function ($q) use ($user) {
            // Public notes are visible to everyone
            $q->where('visibility', 'public');

            if ($user) {
                // Private notes are visible only to author
                $q->orWhere(function ($privateQ) use ($user) {
                    $privateQ->where('visibility', 'private')
                        ->where('author_id', $user->id);
                });

                // Classroom notes are visible to active members
                $q->orWhere(function ($classroomQ) use ($user) {
                    $classroomQ->where('visibility', 'classroom')
                        ->whereExists(function ($memberQuery) use ($user) {
                            $memberQuery->select('id')
                                ->from('classroom_members')
                                ->whereColumn('classroom_members.classroom_id', 'notes.classroom_id')
                                ->where('classroom_members.user_id', $user->id)
                                ->where('classroom_members.status', 'active');
                        });
                });

                // specific_users notes are visible to permitted users
                $q->orWhere(function ($specificQ) use ($user) {
                    $specificQ->where('visibility', 'specific_users')
                        ->whereExists(function ($permQuery) use ($user) {
                            $permQuery->select('id')
                                ->from('note_permissions')
                                ->whereColumn('note_permissions.note_id', 'notes.id')
                                ->where('note_permissions.user_id', $user->id);
                        });
                });

                // Author can always see their own notes
                $q->orWhere('author_id', $user->id);
            }
        });

        // Filter by school_id
        if ($request->filled('school_id')) {
            $query->where('school_id', $request->school_id);
        }

        // Filter by classroom_id
        if ($request->filled('classroom_id')) {
            $query->where('classroom_id', $request->classroom_id);
        }

        // Filter by subject
        if ($request->filled('subject')) {
            $query->where('subject', $request->subject);
        }

        // Filter by grade
        if ($request->filled('grade')) {
            $query->where('grade', $request->grade);
        }

        // Filter by visibility
        if ($request->filled('visibility')) {
            $query->where('visibility', $request->visibility);
        }

        // Filter by mode
        if ($request->filled('mode')) {
            $query->where('mode', $request->mode);
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
     * Show a specific note.
     */
    public function show(Note $note): JsonResponse
    {
        $this->authorize('view', $note);

        $note->load(['author', 'school', 'classroom']);

        // Load permitted users for specific_users visibility
        if ($note->visibility === 'specific_users') {
            $note->load(['permissions.user']);
        }

        return response()->json([
            'data' => new NoteResource($note),
        ]);
    }

    /**
     * Create a new note.
     */
    public function store(StoreNoteRequest $request): JsonResponse
    {
        $this->authorize('create', Note::class);

        $note = $this->service->create($request->validated(), $request->user());
        $note->load(['author', 'school', 'classroom']);

        return response()->json([
            'data' => new NoteResource($note),
        ], 201);
    }

    /**
     * Update note (author only).
     */
    public function update(UpdateNoteRequest $request, Note $note): JsonResponse
    {
        $this->authorize('update', $note);

        $note = $this->service->update($note, $request->validated());
        $note->load(['author', 'school', 'classroom']);

        return response()->json([
            'data' => new NoteResource($note),
        ]);
    }

    /**
     * Delete note (author only).
     */
    public function destroy(Note $note): JsonResponse
    {
        $this->authorize('delete', $note);

        $this->service->delete($note);

        return response()->json(null, 204);
    }

    /**
     * Grant user access to note (author only, visibility=specific_users).
     */
    public function grantPermission(GrantNotePermissionRequest $request, Note $note): JsonResponse
    {
        $this->authorize('managePermissions', $note);

        try {
            $permission = $this->service->grantPermission($note, $request->user_id);
            $permission->load('user');

            return response()->json([
                'data' => new NotePermissionResource($permission),
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Revoke user access from note (author only, visibility=specific_users).
     */
    public function revokePermission(Note $note, User $user): JsonResponse
    {
        $this->authorize('managePermissions', $note);

        try {
            $this->service->revokePermission($note, $user->id);

            return response()->json(null, 204);
        } catch (\Exception $e) {
            return response()->json([
                'message' => $e->getMessage(),
            ], 400);
        }
    }
}