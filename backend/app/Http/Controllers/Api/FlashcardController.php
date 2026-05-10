<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreFlashcardRequest;
use App\Http\Requests\UpdateFlashcardRequest;
use App\Http\Resources\FlashcardResource;
use App\Models\Flashcard;
use App\Models\Note;
use App\Policies\FlashcardPolicy;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FlashcardController extends Controller
{
    /**
     * List flashcards for a note.
     * User must be able to view the note.
     */
    public function index(Note $note, Request $request): JsonResponse
    {
        $this->authorize('viewAny', [Flashcard::class, $note]);

        $flashcards = Flashcard::where('note_id', $note->id)
            ->orderBy('sort_order')
            ->paginate(15);

        return response()->json([
            'data' => FlashcardResource::collection($flashcards->items()),
            'meta' => [
                'current_page' => $flashcards->currentPage(),
                'last_page' => $flashcards->lastPage(),
                'per_page' => $flashcards->perPage(),
                'total' => $flashcards->total(),
            ],
        ]);
    }

    /**
     * Create a flashcard for a note.
     * Only note author can create.
     */
    public function store(Note $note, StoreFlashcardRequest $request): JsonResponse
    {
        $this->authorize('create', [Flashcard::class, $note]);

        $flashcard = Flashcard::create([
            'note_id' => $note->id,
            'front' => $request->front_text,
            'back' => $request->back_text,
            'sort_order' => $request->position ?? 0,
        ]);

        return response()->json([
            'data' => new FlashcardResource($flashcard),
        ], 201);
    }

    /**
     * Update a flashcard.
     * Only note author can update.
     */
    public function update(Flashcard $flashcard, UpdateFlashcardRequest $request): JsonResponse
    {
        $this->authorize('update', $flashcard);

        $data = [];
        if ($request->has('front_text')) {
            $data['front'] = $request->front_text;
        }
        if ($request->has('back_text')) {
            $data['back'] = $request->back_text;
        }
        if ($request->has('position')) {
            $data['sort_order'] = $request->position;
        }

        if (!empty($data)) {
            $flashcard->update($data);
        }

        return response()->json([
            'data' => new FlashcardResource($flashcard->fresh()),
        ]);
    }

    /**
     * Delete a flashcard.
     * Only note author can delete.
     */
    public function destroy(Flashcard $flashcard): JsonResponse
    {
        $this->authorize('delete', $flashcard);

        $flashcard->delete();

        return response()->json(null, 204);
    }
}
