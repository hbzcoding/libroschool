<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\ResolveReportRequest;
use App\Http\Resources\ReportResource;
use App\Models\Report;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminReportController extends Controller
{
    /**
     * List all reports with pagination and filters (admin only).
     */
    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Report::class);

        $query = Report::query()->with('reporter');

        // Filter by status
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Filter by target_type
        if ($request->filled('target_type')) {
            $query->where('target_type', $request->target_type);
        }

        // Filter by target_id
        if ($request->filled('target_id')) {
            $query->where('target_id', $request->target_id);
        }

        // Filter by reporter_id
        if ($request->filled('reporter_id')) {
            $query->where('reporter_id', $request->reporter_id);
        }

        $reports = $query->orderBy('created_at', 'desc')->paginate(15);

        return response()->json([
            'data' => ReportResource::collection($reports->items()),
            'meta' => [
                'current_page' => $reports->currentPage(),
                'last_page' => $reports->lastPage(),
                'per_page' => $reports->perPage(),
                'total' => $reports->total(),
            ],
        ]);
    }

    /**
     * Show a specific report (admin only).
     */
    public function show(Report $report): JsonResponse
    {
        $this->authorize('view', $report);

        $report->load('reporter');

        return response()->json([
            'data' => new ReportResource($report),
        ]);
    }

    /**
     * Resolve a report (admin only).
     */
    public function resolve(ResolveReportRequest $request, Report $report): JsonResponse
    {
        $this->authorize('resolve', $report);

        if (! $report->isOpen()) {
            return response()->json([
                'message' => 'This report has already been resolved.',
            ], 409);
        }

        $report->update([
            'status' => $request->status,
        ]);

        $report->load('reporter');

        return response()->json([
            'data' => new ReportResource($report),
        ]);
    }
}
