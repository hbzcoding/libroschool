<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

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

    /**
     * Latest message in the conversation.
     */
    public function latestMessage(): HasOne
    {
        return $this->hasOne(Message::class)->latestOfMany();
    }

    /**
     * Users participating in the conversation (through members).
     */
    public function users(): HasMany
    {
        return $this->hasManyThrough(
            User::class,
            ConversationMember::class,
            'conversation_id',
            'id',
            'id',
            'user_id'
        );
    }
}
