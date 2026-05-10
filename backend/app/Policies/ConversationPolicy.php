<?php

namespace App\Policies;

use App\Models\Conversation;
use App\Models\User;

class ConversationPolicy
{
    /**
     * Determine whether the user can view any models.
     * Users can only see their own conversations.
     */
    public function viewAny(User $user): bool
    {
        return true;
    }

    /**
     * Determine whether the user can view the model.
     * Only conversation members can view a conversation.
     */
    public function view(User $user, Conversation $conversation): bool
    {
        return $conversation->members()->where('user_id', $user->id)->exists();
    }

    /**
     * Determine whether the user can create models.
     * Authenticated users can create conversations.
     */
    public function create(User $user): bool
    {
        return true;
    }

    /**
     * Determine whether the user can view messages in the conversation.
     * Only conversation members can view messages.
     */
    public function viewMessages(User $user, Conversation $conversation): bool
    {
        return $conversation->members()->where('user_id', $user->id)->exists();
    }

    /**
     * Determine whether the user can send messages in the conversation.
     * Only conversation members can send messages.
     */
    public function sendMessage(User $user, Conversation $conversation): bool
    {
        return $conversation->members()->where('user_id', $user->id)->exists();
    }
}