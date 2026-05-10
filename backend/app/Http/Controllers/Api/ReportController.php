<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ResolveReportRequest;
use App\Http\Requests\StoreReportRequest;
use App\Http\Resources\ReportResource;
use App\Models\Book;
use App\Models\BookRequest;
use App\Models\Classroom;
use App\Models\Note;
use App\Models\Report;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReportController extends Controller
{
    /**
     * Create a new report.
     */
    public function store(StoreReportRequest $request): JsonResponse
    {
        $this->authorize('create', Report::class);

        $targetType = $request->target_type;
        $targetId = $request->target_id;

        // Verify the target exists
        $targetExists = $this->targetExists($targetType, $targetId);
        if (! $targetExists) {
            return response()->json([
                'message' => 'The specified target does not exist.',
            ], 404);
        }

        // Check for duplicate report by same user on same target
        $existingReport = Report::where('reporter_id', $request->user()->id)
            ->where('target_type', $targetType)
            ->where('target_id', $targetId)
            ->where('status', 'open')
            ->first();

        if ($existingReport) {
            return response()->json([
                'message' => 'You have already reported this content.',
            ], 409);
        }

        $report = Report::create([
            'reporter_id' => $request->user()->id,
            'target_type' => $targetType,
            'target_id' => $targetId,
            'reason' => $request->reason,
            'status' => 'open',
        ]);

        $report->load('reporter');

        return response()->json([
            'data' => new ReportResource($report),
        ], 201);
    }

    /**
     * Check if the target entity exists.
     */
    private function targetExists(string $targetType, int $targetId): bool
    {
        return match ($targetType) {
            'Book' => Book::where('id', $targetId)->exists(),
            'BookRequest' => BookRequest::where('id', $targetId)->exists(),
            'Note' => Note::where('id', $targetId)->exists(),
            'Classroom' => Classroom::where('id', $targetId)->exists(),
            'User' => User::where('id', $targetId)->exists(),
            default => false,
        };
    }
}
