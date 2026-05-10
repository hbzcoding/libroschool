<?php

namespace App\Services;

use App\Models\Note;
use App\Models\NotePermission;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class NoteService
{
    /**
     * Create a new note with author.
     */
    public function create(array $data, User $author): Note
    {
        return DB::transaction(function () use ($data, $author) {
            $data['author_id'] = $author->id;
            
            $note = Note::create($data);
            
            return $note;
        });
    }

    /**
     * Update note.
     */
    public function update(Note $note, array $data): Note
    {
        $note->update($data);
        $note->refresh();

        return $note;
    }

    /**
     * Delete note.
     */
    public function delete(Note $note): void
    {
        DB::transaction(function () use ($note) {
            // Delete associated permissions first
            $note->permissions()->delete();
            
            // Delete the note
            $note->delete();
        });
    }

    /**
     * Grant user access to a note.
     * Only works for notes with visibility=specific_users.
     */
    public function grantPermission(Note $note, int $userId): NotePermission
    {
        if ($note->visibility !== 'specific_users') {
            throw new \Exception('Permissions can only be granted for notes with specific_users visibility.');
        }

        if ($note->author_id === $userId) {
            throw new \Exception('Cannot grant permission to the note author.');
        }

        return $note->permissions()->create([
            'user_id' => $userId,
        ]);
    }

    /**
     * Revoke user access from a note.
     * Only works for notes with visibility=specific_users.
     */
    public function revokePermission(Note $note, int $userId): void
    {
        if ($note->visibility !== 'specific_users') {
            throw new \Exception('Permissions can only be revoked for notes with specific_users visibility.');
        }

        $permission = $note->permissions()
            ->where('user_id', $userId)
            ->first();

        if (!$permission) {
            throw new \Exception('User does not have access to this note.');
        }

        $permission->delete();
    }
}