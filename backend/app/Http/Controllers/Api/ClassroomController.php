<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\JoinClassroomByCodeRequest;
use App\Http\Requests\StoreClassroomRequest;
use App\Http\Requests\UpdateClassroomRequest;
use App\Http\Requests\UpdateMemberRoleRequest;
use App\Http\Resources\ClassroomMemberResource;
use App\Http\Resources\ClassroomResource;
use App\Models\Classroom;
use App\Models\User;
use App\Services\ClassroomService;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ClassroomController extends Controller
{
    private ClassroomService $service;

    public function __construct(ClassroomService $service)
    {
        $this->service = $service;
    }

    /**
     * List classrooms with pagination and filters.
     */
    public function index(Request $request): JsonResponse
    {
        $user = auth()->user();
        $query = Classroom::query()
            ->with(['school', 'owner'])
            ->withCount(['members as members_count' => function ($q) {
                $q->where('status', 'active');
            }])
            ->where('status', 'active');

        // Public classrooms are visible to everyone
        // Private classrooms are visible only to members
        $query->where(function ($q) use ($user) {
            $q->where('visibility', 'public');

            if ($user) {
                $q->orWhereHas('members', function ($memberQ) use ($user) {
                    $memberQ->where('user_id', $user->id)
                        ->where('status', 'active');
                });
            }
        });

        // Filter by school_id
        if ($request->filled('school_id')) {
            $query->where('school_id', $request->school_id);
        }

        // Filter by grade
        if ($request->filled('grade')) {
            $query->where('grade', $request->grade);
        }

        // Filter by academic_year
        if ($request->filled('academic_year')) {
            $query->where('academic_year', $request->academic_year);
        }

        // Filter by is_private (visibility)
        if ($request->filled('is_private')) {
            $isPrivate = filter_var($request->is_private, FILTER_VALIDATE_BOOLEAN);
            $query->where('visibility', $isPrivate ? 'private' : 'public');
        }

        // Search by name
        if ($request->filled('search')) {
            $search = strtolower($request->search);
            $query->where(function ($q) use ($search) {
                $q->whereRaw('LOWER(name) LIKE ?', ["%{$search}%"])
                    ->orWhereRaw('LOWER(description) LIKE ?', ["%{$search}%"]);
            });
        }

        $classrooms = $query->orderBy('created_at', 'desc')->paginate(15);

        return response()->json([
            'data' => ClassroomResource::collection($classrooms->items()),
            'meta' => [
                'current_page' => $classrooms->currentPage(),
                'last_page' => $classrooms->lastPage(),
                'per_page' => $classrooms->perPage(),
                'total' => $classrooms->total(),
            ],
        ]);
    }

    /**
     * Show a specific classroom.
     */
    public function show(Classroom $classroom): JsonResponse
    {
        $this->authorize('view', $classroom);

        $classroom->load(['school', 'owner']);
        $classroom->members_count = $classroom->activeMembersCount();

        return response()->json([
            'data' => new ClassroomResource($classroom),
        ]);
    }

    /**
     * Create a new classroom.
     */
    public function store(StoreClassroomRequest $request): JsonResponse
    {
        $this->authorize('create', Classroom::class);

        try {
            $classroom = $this->service->create($request->validated(), $request->user());
            $classroom->load(['school', 'owner']);
            $classroom->members_count = 1;
        } catch (UniqueConstraintViolationException $e) {
            return response()->json([
                'message' => 'A classroom with this school, academic year, grade, section, and track already exists.',
            ], 422);
        } catch (\Exception $e) {
            if (str_contains($e->getMessage(), 'UNIQUE constraint failed') || str_contains($e->getMessage(), 'duplicate key')) {
                return response()->json([
                    'message' => 'A classroom with this school, academic year, grade, section, and track already exists.',
                ], 422);
            }
            throw $e;
        }

        return response()->json([
            'data' => new ClassroomResource($classroom),
        ], 201);
    }

    /**
     * Update classroom settings.
     */
    public function update(UpdateClassroomRequest $request, Classroom $classroom): JsonResponse
    {
        $this->authorize('update', $classroom);

        $classroom = $this->service->update($classroom, $request->validated());
        $classroom->load(['school', 'owner']);
        $classroom->members_count = $classroom->activeMembersCount();

        return response()->json([
            'data' => new ClassroomResource($classroom),
        ]);
    }

    /**
     * Delete a classroom.
     */
    public function destroy(Classroom $classroom): JsonResponse
    {
        $this->authorize('delete', $classroom);

        $this->service->delete($classroom);

        return response()->json(null, 204);
    }

    /**
     * Join a classroom.
     */
    public function join(Classroom $classroom): JsonResponse
    {
        $this->authorize('join', $classroom);

        if (!$classroom->isOpenJoin()) {
            return response()->json([
                'message' => 'This classroom requires a join code.',
            ], 403);
        }

        $member = $this->service->join($classroom, auth()->user());
        $member->load('user');

        $classroom->load(['school', 'owner']);
        $classroom->members_count = $classroom->activeMembersCount();

        return response()->json([
            'data' => [
                'classroom' => new ClassroomResource($classroom),
                'member' => new ClassroomMemberResource($member),
            ],
        ]);
    }

    /**
     * Join a classroom by code.
     */
    public function joinByCode(JoinClassroomByCodeRequest $request): JsonResponse
    {
        try {
            $result = $this->service->joinByCode($request->join_code, $request->user());
            $classroom = $result['classroom'];
            $member = $result['member'];

            $classroom->members_count = $classroom->activeMembersCount();

            return response()->json([
                'data' => [
                    'classroom' => new ClassroomResource($classroom),
                    'member' => new ClassroomMemberResource($member),
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Leave a classroom.
     */
    public function leave(Classroom $classroom): JsonResponse
    {
        $this->authorize('leave', $classroom);

        $this->service->leave($classroom, auth()->user());

        return response()->json(null, 204);
    }

    /**
     * List members of a classroom.
     */
    public function members(Classroom $classroom): JsonResponse
    {
        $this->authorize('viewMembers', $classroom);

        $members = $classroom->members()
            ->with('user')
            ->where('status', 'active')
            ->orderBy('role', 'desc')
            ->orderBy('created_at', 'asc')
            ->paginate(15);

        return response()->json([
            'data' => ClassroomMemberResource::collection($members->items()),
            'meta' => [
                'current_page' => $members->currentPage(),
                'last_page' => $members->lastPage(),
                'per_page' => $members->perPage(),
                'total' => $members->total(),
            ],
        ]);
    }

    /**
     * Update member role.
     */
    public function updateMemberRole(UpdateMemberRoleRequest $request, Classroom $classroom, User $user): JsonResponse
    {
        $this->authorize('manageMembers', $classroom);

        // Check that the target is not the owner
        if ($classroom->isOwnedBy($user->id)) {
            return response()->json([
                'message' => 'Cannot change the role of the owner.',
            ], 403);
        }

        try {
            $member = $this->service->updateMemberRole($classroom, $user, $request->role);
            $member->load('user');

            return response()->json([
                'data' => new ClassroomMemberResource($member),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Remove a member from the classroom.
     */
    public function removeMember(Classroom $classroom, User $user): JsonResponse
    {
        $this->authorize('removeMember', $classroom);

        // Check that the target is not the owner
        if ($classroom->isOwnedBy($user->id)) {
            return response()->json([
                'message' => 'Cannot remove the owner from the classroom.',
            ], 403);
        }

        try {
            $this->service->removeMember($classroom, $user);

            return response()->json(null, 204);
        } catch (\Exception $e) {
            return response()->json([
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Regenerate join code.
     */
    public function regenerateJoinCode(Classroom $classroom): JsonResponse
    {
        $this->authorize('regenerateJoinCode', $classroom);

        $newCode = $this->service->regenerateJoinCode($classroom);

        return response()->json([
            'data' => [
                'join_code' => $newCode,
            ],
        ]);
    }
}