<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminUserController extends Controller
{
    /**
     * List all users with pagination and filters (admin only).
     */
    public function index(Request $request): JsonResponse
    {
        $request->user()->authorizeAdmin();

        $query = User::query()->with('school');

        // Filter by role
        if ($request->filled('role')) {
            $query->where('role', $request->role);
        }

        // Filter by school_id
        if ($request->filled('school_id')) {
            $query->where('school_id', $request->school_id);
        }

        // Search by name or email
        if ($request->filled('search')) {
            $search = strtolower($request->search);
            $query->where(function ($q) use ($search) {
                $q->whereRaw('LOWER(name) LIKE ?', ["%{$search}%"])
                    ->orWhereRaw('LOWER(email) LIKE ?', ["%{$search}%"]);
            });
        }

        $users = $query->orderBy('created_at', 'desc')->paginate(15);

        return response()->json([
            'data' => UserResource::collection($users->items()),
            'meta' => [
                'current_page' => $users->currentPage(),
                'last_page' => $users->lastPage(),
                'per_page' => $users->perPage(),
                'total' => $users->total(),
            ],
        ]);
    }

    /**
     * Show a specific user (admin only).
     */
    public function show(Request $request, User $user): JsonResponse
    {
        $request->user()->authorizeAdmin();

        $user->load('school');

        return response()->json([
            'data' => new UserResource($user),
        ]);
    }

    /**
     * Update a user (admin only).
     */
    public function update(Request $request, User $user): JsonResponse
    {
        $request->user()->authorizeAdmin();

        $validated = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'email' => ['sometimes', 'string', 'email', 'max:255', 'unique:users,email,' . $user->id],
            'role' => ['sometimes', 'string', 'in:student,teacher,admin'],
            'school_id' => ['sometimes', 'nullable', 'exists:schools,id'],
            'grade' => ['sometimes', 'nullable', 'string', 'max:20'],
            'track' => ['sometimes', 'nullable', 'string', 'max:100'],
        ]);

        $user->update($validated);

        $user->load('school');

        return response()->json([
            'data' => new UserResource($user),
        ]);
    }

    /**
     * Ban a user (admin only).
     */
    public function ban(Request $request, User $user): JsonResponse
    {
        $request->user()->authorizeAdmin();

        if ($user->isAdmin()) {
            return response()->json([
                'message' => 'Cannot ban an admin user.',
            ], 403);
        }

        $user->update(['role' => 'banned']);

        return response()->json([
            'data' => new UserResource($user),
        ]);
    }
}
