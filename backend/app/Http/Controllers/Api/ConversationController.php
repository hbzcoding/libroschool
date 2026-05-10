<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreConversationRequest;
use App\Http\Requests\StoreMessageRequest;
use App\Http\Resources\ConversationResource;
use App\Http\Resources\MessageResource;
use App\Models\Conversation;
use App\Models\Message;
use Illuminate\Http\JsonResponse;

class ConversationController extends Controller
{
    /**
     * List conversations where the current user is a member.
     */
    public function index(): JsonResponse
    {
        $user = auth()->user();

        $conversations = Conversation::query()
            ->whereHas('members', function ($query) use ($user) {
                $query->where('user_id', $user->id);
            })
            ->with(['book', 'bookRequest', 'members', 'latestMessage'])
            ->orderBy('updated_at', 'desc')
            ->paginate(15);

        return response()->json([
            'data' => ConversationResource::collection($conversations->items()),
            'meta' => [
                'current_page' => $conversations->currentPage(),
                'last_page' => $conversations->lastPage(),
                'per_page' => $conversations->perPage(),
                'total' => $conversations->total(),
            ],
        ]);
    }

    /**
     * Show a specific conversation.
     */
    public function show(Conversation $conversation): JsonResponse
    {
        $this->authorize('view', $conversation);

        $conversation->load(['book', 'bookRequest', 'members']);

        return response()->json([
            'data' => new ConversationResource($conversation),
        ]);
    }

    /**
     * Create or return existing conversation.
     */
    public function store(StoreConversationRequest $request): JsonResponse
    {
        $this->authorize('create', Conversation::class);

        $user = auth()->user();
        $recipientId = $request->recipient_id;
        $bookId = $request->book_id;
        $bookRequestId = $request->book_request_id;

        // Check if conversation already exists between the two users for the same context
        $existingConversation = $this->findExistingConversation($user->id, $recipientId, $bookId, $bookRequestId);

        if ($existingConversation) {
            $existingConversation->load(['book', 'bookRequest', 'members']);

            return response()->json([
                'data' => new ConversationResource($existingConversation),
            ]);
        }

        // Create new conversation
        $conversation = Conversation::create([
            'book_id' => $bookId,
            'book_request_id' => $bookRequestId,
        ]);

        // Add both users as members
        $conversation->members()->createMany([
            ['user_id' => $user->id],
            ['user_id' => $recipientId],
        ]);

        $conversation->load(['book', 'bookRequest', 'members']);

        return response()->json([
            'data' => new ConversationResource($conversation),
        ], 201);
    }

    /**
     * List messages in a conversation.
     */
    public function messages(Conversation $conversation): JsonResponse
    {
        $this->authorize('viewMessages', $conversation);

        $messages = $conversation->messages()
            ->with('sender')
            ->orderBy('created_at', 'asc')
            ->paginate(15);

        return response()->json([
            'data' => MessageResource::collection($messages->items()),
            'meta' => [
                'current_page' => $messages->currentPage(),
                'last_page' => $messages->lastPage(),
                'per_page' => $messages->perPage(),
                'total' => $messages->total(),
            ],
        ]);
    }

    /**
     * Send a message in a conversation.
     */
    public function sendMessage(StoreMessageRequest $request, Conversation $conversation): JsonResponse
    {
        $this->authorize('sendMessage', $conversation);

        $message = $conversation->messages()->create([
            'sender_id' => auth()->id(),
            'body' => $request->body,
        ]);

        // Touch conversation to update updated_at
        $conversation->touch();

        $message->load('sender');

        return response()->json([
            'data' => new MessageResource($message),
        ], 201);
    }

    /**
     * Find existing conversation between two users for the same context.
     */
    private function findExistingConversation(
        int $userId,
        int $recipientId,
        ?int $bookId,
        ?int $bookRequestId
    ): ?Conversation {
        $query = Conversation::query()
            ->whereHas('members', function ($q) use ($userId) {
                $q->where('user_id', $userId);
            })
            ->whereHas('members', function ($q) use ($recipientId) {
                $q->where('user_id', $recipientId);
            });

        if ($bookId !== null) {
            $query->where('book_id', $bookId)->whereNull('book_request_id');
        } elseif ($bookRequestId !== null) {
            $query->where('book_request_id', $bookRequestId)->whereNull('book_id');
        }

        return $query->first();
    }
}