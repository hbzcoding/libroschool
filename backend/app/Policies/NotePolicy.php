<?php

namespace App\Policies;

use App\Models\ClassroomMember;
use App\Models\Note;
use App\Models\User;

class NotePolicy
{
    /**
     * Determine whether the user can view any notes.
     * Authenticated users can view notes visible to them.
     */
    public function viewAny(?User $user): bool
    {
        // Public notes are visible to everyone
        // Private/classroom/specific_users notes require authentication
        return true;
    }

    /**
     * Determine whether the user can view the note.
     * 
     * Visibility rules:
     * - public: visible to all users (including guests)
     * - private: visible only to author
     * - classroom: visible to active classroom members
     * - specific_users: visible to author + users in note_permissions
     */
    public function view(?User $user, Note $note): bool
    {
        // Public notes are visible to everyone
        if ($note->isPublic()) {
            return true;
        }

        // Private notes are visible only to author
        if ($note->isPrivate()) {
            return $user !== null && $note->author_id === $user->id;
        }

        // Classroom notes are visible to active members
        if ($note->isClassroomVisible()) {
            if ($user === null) {
                return false;
            }

            // Author can always view their own notes
            if ($note->author_id === $user->id) {
                return true;
            }

            // Check if user is an active member of the classroom
            return ClassroomMember::where('classroom_id', $note->classroom_id)
                ->where('user_id', $user->id)
                ->where('status', 'active')
                ->exists();
        }

        // specific_users: visible to author + permitted users
        if ($user === null) {
            return false;
        }

        // Author can always view their own notes
        if ($note->author_id === $user->id) {
            return true;
        }

        // Check if user is in note_permissions
        return $note->permissions()
            ->where('user_id', $user->id)
            ->exists();
    }

    /**
     * Determine whether the user can create notes.
     * Any authenticated user can create notes.
     */
    public function create(User $user): bool
    {
        return true;
    }

    /**
     * Determine whether the user can update the note.
     * Only the author can update.
     */
    public function update(User $user, Note $note): bool
    {
        return $note->author_id === $user->id;
    }

    /**
     * Determine whether the user can delete the note.
     * Only the author can delete.
     */
    public function delete(User $user, Note $note): bool
    {
        return $note->author_id === $user->id;
    }

    /**
     * Determine whether the user can manage permissions for the note.
     * Only the author can manage permissions, and only for specific_users visibility.
     */
    public function managePermissions(User $user, Note $note): bool
    {
        return $note->author_id === $user->id && $note->visibility === 'specific_users';
    }
}