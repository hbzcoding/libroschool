<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class School extends Model
{
    /** @use HasFactory<\Database\Factories\SchoolFactory> */
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'code',
        'name',
        'city',
        'province',
        'region',
        'country',
        'school_type',
    ];

    /**
     * Users belonging to this school.
     */
    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }

    /**
     * Books listed for this school.
     */
    public function books(): HasMany
    {
        return $this->hasMany(Book::class);
    }

    /**
     * Book requests for this school.
     */
    public function bookRequests(): HasMany
    {
        return $this->hasMany(BookRequest::class);
    }

    /**
     * Classrooms in this school.
     */
    public function classrooms(): HasMany
    {
        return $this->hasMany(Classroom::class);
    }

    /**
     * Notes for this school.
     */
    public function notes(): HasMany
    {
        return $this->hasMany(Note::class);
    }
}
