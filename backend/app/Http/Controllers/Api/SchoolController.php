<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreSchoolRequest;
use App\Http\Resources\SchoolResource;
use App\Models\School;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SchoolController extends Controller
{
    /**
     * List schools with pagination and filters.
     */
    public function index(Request $request): JsonResponse
    {
        $query = School::query();

        // Search by name/code/city/province/region (case-insensitive)
        if ($request->filled('search')) {
            $search = strtolower($request->search);
            $query->where(function ($q) use ($search) {
                $q->whereRaw('LOWER(name) LIKE ?', ["%{$search}%"])
                    ->orWhereRaw('LOWER(code) LIKE ?', ["%{$search}%"])
                    ->orWhereRaw('LOWER(city) LIKE ?', ["%{$search}%"])
                    ->orWhereRaw('LOWER(province) LIKE ?', ["%{$search}%"])
                    ->orWhereRaw('LOWER(region) LIKE ?', ["%{$search}%"]);
            });
        }

        // Filter by city (case-insensitive)
        if ($request->filled('city')) {
            $city = strtolower($request->city);
            $query->whereRaw('LOWER(city) LIKE ?', ["%{$city}%"]);
        }

        // Filter by province (case-insensitive)
        if ($request->filled('province')) {
            $province = strtolower($request->province);
            $query->whereRaw('LOWER(province) LIKE ?', ["%{$province}%"]);
        }

        // Filter by region (case-insensitive)
        if ($request->filled('region')) {
            $region = strtolower($request->region);
            $query->whereRaw('LOWER(region) LIKE ?', ["%{$region}%"]);
        }

        // Filter by school_type
        if ($request->filled('school_type')) {
            $query->where('school_type', $request->school_type);
        }

        $schools = $query->orderBy('name')->paginate(15);

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
     * Show a specific school.
     */
    public function show(School $school): JsonResponse
    {
        return response()->json([
            'data' => new SchoolResource($school),
        ]);
    }

    /**
     * Create a new school (admin only).
     */
    public function store(StoreSchoolRequest $request): JsonResponse
    {
        $this->authorize('create', School::class);

        $school = School::create($request->validated());

        return response()->json([
            'data' => new SchoolResource($school),
        ], 201);
    }
}
