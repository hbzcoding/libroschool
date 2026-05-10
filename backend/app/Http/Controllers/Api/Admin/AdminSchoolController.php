<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreSchoolRequest;
use App\Http\Requests\UpdateSchoolRequest;
use App\Http\Resources\SchoolResource;
use App\Models\School;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminSchoolController extends Controller
{
    /**
     * List all schools with pagination and filters (admin only).
     */
    public function index(Request $request): JsonResponse
    {
        $request->user()->authorizeAdmin();

        $query = School::query();

        // Filter by city
        if ($request->filled('city')) {
            $city = strtolower($request->city);
            $query->whereRaw('LOWER(city) LIKE ?', ["%{$city}%"]);
        }

        // Filter by province
        if ($request->filled('province')) {
            $province = strtolower($request->province);
            $query->whereRaw('LOWER(province) LIKE ?', ["%{$province}%"]);
        }

        // Filter by region
        if ($request->filled('region')) {
            $region = strtolower($request->region);
            $query->whereRaw('LOWER(region) LIKE ?', ["%{$region}%"]);
        }

        // Filter by school_type
        if ($request->filled('school_type')) {
            $query->where('school_type', $request->school_type);
        }

        // Search by name or code
        if ($request->filled('search')) {
            $search = strtolower($request->search);
            $query->where(function ($q) use ($search) {
                $q->whereRaw('LOWER(name) LIKE ?', ["%{$search}%"])
                    ->orWhereRaw('LOWER(code) LIKE ?', ["%{$search}%"]);
            });
        }

        $schools = $query->orderBy('created_at', 'desc')->paginate(15);

        return response()->json([
            'data' => SchoolResource::collection($schools->items()),
            'meta' => [
                'current_page' => $schools->currentPage(),
                'last_page' => $schools->lastPage(),
                'per_page' => $schools->perPage(),
                'total' => $schools->total(),
            ],
        ]);
    }

    /**
     * Create a new school (admin only).
     */
    public function store(StoreSchoolRequest $request): JsonResponse
    {
        $request->user()->authorizeAdmin();

        $school = School::create($request->validated());

        return response()->json([
            'data' => new SchoolResource($school),
        ], 201);
    }

    /**
     * Show a specific school (admin only).
     */
    public function show(Request $request, School $school): JsonResponse
    {
        $request->user()->authorizeAdmin();

        return response()->json([
            'data' => new SchoolResource($school),
        ]);
    }

    /**
     * Update a school (admin only).
     */
    public function update(UpdateSchoolRequest $request, School $school): JsonResponse
    {
        $request->user()->authorizeAdmin();

        $school->update($request->validated());

        return response()->json([
            'data' => new SchoolResource($school),
        ]);
    }

    /**
     * Delete a school (admin only).
     */
    public function destroy(Request $request, School $school): JsonResponse
    {
        $request->user()->authorizeAdmin();

        // Check if school has users/books/etc before deleting
        $usersCount = $school->users()->count();
        if ($usersCount > 0) {
            return response()->json([
                'message' => "Cannot delete school. It has {$usersCount} users associated.",
            ], 409);
        }

        $school->delete();

        return response()->json(null, 204);
    }
}