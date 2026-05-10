<?php

namespace App\Policies;

use App\Models\BookRequest;
use App\Models\User;

class BookRequestPolicy
{
    /**
     * Determine whether the user can view any models.
     * Guests can view open requests.
     */
    public function viewAny(?User $user): bool
    {
        return true;
    }

    /**
     * Determine whether the user can view the model.
     * Guests can view request details.
     */
    public function view(?User $user, BookRequest $bookRequest): bool
    {
        return true;
    }

    /**
     * Determine whether the user can create models.
     * Only authenticated users can create requests.
     */
    public function create(User $user): bool
    {
        return true;
    }

    /**
     * Determine whether the user can update the model.
     * Only the buyer can update their own request.
     */
    public function update(User $user, BookRequest $bookRequest): bool
    {
        return $user->id === $bookRequest->buyer_id;
    }

    /**
     * Determine whether the user can delete the model.
     * Only the buyer can delete their own request.
     */
    public function delete(User $user, BookRequest $bookRequest): bool
    {
        return $user->id === $bookRequest->buyer_id;
    }

    /**
     * Determine whether the user can close the request.
     * Only the buyer can close their own request.
     */
    public function close(User $user, BookRequest $bookRequest): bool
    {
        return $user->id === $bookRequest->buyer_id;
    }
}
