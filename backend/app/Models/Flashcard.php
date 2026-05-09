<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Flashcard extends Model
{
    /** @use HasFactory<\Database\Factories\FlashcardFactory> */
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'note_id',
        'front',
        'back',
        'sort_order',
    ];

    /**
     * The note this flashcard belongs to.
     */
    public function note(): BelongsTo
    {
        return $this->belongsTo(Note::class);
    }
}
