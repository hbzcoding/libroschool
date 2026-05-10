<?php

namespace App\Policies;

use App\Models\Book;
use App\Models\User;

class BookPolicy
{
    /**
     * Determine whether the user can view any models.
     * Guests can view available books.
     */
    public function viewAny(?User $user): bool
    {
        return true;
    }

    /**
     * Determine whether the user can view the model.
     * Guests can view book details.
     */
    public function view(?User $user, Book $book): bool
    {
        return true;
    }

    /**
     * Determine whether the user can create models.
     * Only authenticated users can create books.
     */
    public function create(User $user): bool
    {
        return true;
    }

    /**
     * Determine whether the user can update the model.
     * Only the seller can update their own book.
     */
    public function update(User $user, Book $book): bool
    {
        return $user->id === $book->seller_id;
    }

    /**
     * Determine whether the user can delete the model.
     * Only the seller can delete their own book.
     */
    public function delete(User $user, Book $book): bool
    {
        return $user->id === $book->seller_id;
    }

    /**
     * Determine whether the user can mark the book as reserved.
     * Only the seller can mark their own book as reserved.
     */
    public function markReserved(User $user, Book $book): bool
    {
        return $user->id === $book->seller_id;
    }

    /**
     * Determine whether the user can mark the book as sold.
     * Only the seller can mark their own book as sold.
     */
    public function markSold(User $user, Book $book): bool
    {
        return $user->id === $book->seller_id;
    }
}
