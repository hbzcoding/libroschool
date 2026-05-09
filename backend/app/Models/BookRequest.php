<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class BookRequest extends Model
{
    /** @use HasFactory<\Database\Factories\BookRequestFactory> */
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'buyer_id',
        'school_id',
        'title',
        'isbn',
        'subject',
        'grade',
        'track',
        'max_price',
        'description',
        'status',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'max_price' => 'decimal:2',
    ];

    /**
     * The buyer making the request.
     */
    public function buyer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'buyer_id');
    }

    /**
     * The school for the request.
     */
    public function school(): BelongsTo
    {
        return $this->belongsTo(School::class);
    }

    /**
     * Conversations about this request.
     */
    public function conversations(): HasMany
    {
        return $this->hasMany(Conversation::class);
    }

    /**
     * Check if request is open.
     */
    public function isOpen(): bool
    {
        return $this->status === 'open';
    }

    /**
     * Check if request is matched.
     */
    public function isMatched(): bool
    {
        return $this->status === 'matched';
    }

    /**
     * Check if request is closed.
     */
    public function isClosed(): bool
    {
        return $this->status === 'closed';
    }
}
