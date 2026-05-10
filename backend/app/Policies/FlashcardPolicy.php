<?php

namespace App\Policies;

use App\Models\Flashcard;
use App\Models\Note;
use App\Models\User;

class FlashcardPolicy
{
    /**
     * Determine whether the user can view any flashcards for a note.
     * User must be able to view the note.
     */
    public function viewAny(User $user, Note $note): bool
    {
        // Use NotePolicy to check note visibility
        return (new NotePolicy())->view($user, $note);
    }

    /**
     * Determine whether the user can view the flashcard.
     * User must be able to view the note.
     */
    public function view(User $user, Flashcard $flashcard): bool
    {
        return (new NotePolicy())->view($user, $flashcard->note);
    }

    /**
     * Determine whether the user can create flashcards.
     * Only note author can create flashcards.
     */
    public function create(User $user, Note $note): bool
    {
        return $note->author_id === $user->id;
    }

    /**
     * Determine whether the user can update the flashcard.
     * Only note author can update.
     */
    public function update(User $user, Flashcard $flashcard): bool
    {
        return $flashcard->note->author_id === $user->id;
    }

    /**
     * Determine whether the user can delete the flashcard.
     * Only note author can delete.
     */
    public function delete(User $user, Flashcard $flashcard): bool
    {
        return $flashcard->note->author_id === $user->id;
    }
}
