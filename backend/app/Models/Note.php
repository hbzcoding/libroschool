<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Note extends Model
{
    /** @use HasFactory<\Database\Factories\NoteFactory> */
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'author_id',
        'school_id',
        'classroom_id',
        'title',
        'subject',
        'grade',
        'content',
        'visibility',
        'mode',
    ];

    /**
     * The author of the note.
     */
    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'author_id');
    }

    /**
     * The school the note belongs to (optional).
     */
    public function school(): BelongsTo
    {
        return $this->belongsTo(School::class);
    }

    /**
     * The classroom the note belongs to (optional).
     */
    public function classroom(): BelongsTo
    {
        return $this->belongsTo(Classroom::class);
    }

    /**
     * User-specific permissions for this note.
     */
    public function permissions(): HasMany
    {
        return $this->hasMany(NotePermission::class);
    }

    /**
     * Flashcards for this note (if mode is flashcard).
     */
    public function flashcards(): HasMany
    {
        return $this->hasMany(Flashcard::class);
    }

    /**
     * Check if note is public.
     */
    public function isPublic(): bool
    {
        return $this->visibility === 'public';
    }

    /**
     * Check if note is private.
     */
    public function isPrivate(): bool
    {
        return $this->visibility === 'private';
    }

    /**
     * Check if note is classroom-visible.
     */
    public function isClassroomVisible(): bool
    {
        return $this->visibility === 'classroom';
    }

    /**
     * Check if note has flashcard mode.
     */
    public function isFlashcardMode(): bool
    {
        return $this->mode === 'flashcard';
    }
}
