<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\ClassroomResource;
use App\Models\Classroom;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminClassroomController extends Controller
{
    /**
     * List all classrooms with pagination and filters (admin only).
     */
    public function index(Request $request): JsonResponse
    {
        $request->user()->authorizeAdmin();

        $query = Classroom::query()->with(['school', 'owner']);

        // Filter by status
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Filter by school_id
        if ($request->filled('school_id')) {
            $query->where('school_id', $request->school_id);
        }

        // Filter by visibility
        if ($request->filled('visibility')) {
            $query->where('visibility', $request->visibility);
        }

        // Filter by grade
        if ($request->filled('grade')) {
            $query->where('grade', $request->grade);
        }

        // Filter by academic_year
        if ($request->filled('academic_year')) {
            $query->where('academic_year', $request->academic_year);
        }

        // Search by name
        if ($request->filled('search')) {
            $search = strtolower($request->search);
            $query->whereRaw('LOWER(name) LIKE ?', ["%{$search}%"]);
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
     * Show a specific classroom (admin only).
     */
    public function show(Request $request, Classroom $classroom): JsonResponse
    {
        $request->user()->authorizeAdmin();

        $classroom->load(['school', 'owner']);

        return response()->json([
            'data' => new ClassroomResource($classroom),
        ]);
    }

    /**
     * Lock a classroom (admin only).
     */
    public function lock(Request $request, Classroom $classroom): JsonResponse
    {
        $request->user()->authorizeAdmin();

        $classroom->update(['status' => 'locked']);

        $classroom->load(['school', 'owner']);

        return response()->json([
            'data' => new ClassroomResource($classroom),
        ]);
    }

    /**
     * Delete a classroom (admin only).
     */
    public function destroy(Request $request, Classroom $classroom): JsonResponse
    {
        $request->user()->authorizeAdmin();

        $classroom->delete();

        return response()->json(null, 204);
    }
}
