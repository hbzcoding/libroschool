<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Conversation extends Model
{
    /** @use HasFactory<\Database\Factories\ConversationFactory> */
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'book_id',
        'book_request_id',
    ];

    /**
     * The book this conversation is about (optional).
     */
    public function book(): BelongsTo
    {
        return $this->belongsTo(Book::class);
    }

    /**
     * The book request this conversation is about (optional).
     */
    public function bookRequest(): BelongsTo
    {
        return $this->belongsTo(BookRequest::class);
    }

    /**
     * Members of the conversation.
     */
    public function members(): HasMany
    {
        return $this->hasMany(ConversationMember::class);
    }

    /**
     * Messages in the conversation.
     */
    public function messages(): HasMany
    {
        return $this->hasMany(Message::class);
    }
}
