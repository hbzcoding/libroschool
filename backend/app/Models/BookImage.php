<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BookImage extends Model
{
    /** @use HasFactory<\Database\Factories\BookImageFactory> */
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'book_id',
        'url',
        'path',
        'sort_order',
    ];

    /**
     * The book this image belongs to.
     */
    public function book(): BelongsTo
    {
        return $this->belongsTo(Book::class);
    }
}
