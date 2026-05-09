<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Classroom extends Model
{
    /** @use HasFactory<\Database\Factories\ClassroomFactory> */
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'school_id',
        'owner_id',
        'name',
        'grade',
        'section',
        'track',
        'academic_year',
        'join_code',
        'join_policy',
        'visibility',
        'is_verified',
        'status',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'is_verified' => 'boolean',
    ];

    /**
     * The school the classroom belongs to.
     */
    public function school(): BelongsTo
    {
        return $this->belongsTo(School::class);
    }

    /**
     * The owner of the classroom.
     */
    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    /**
     * Members of the classroom.
     */
    public function members(): HasMany
    {
        return $this->hasMany(ClassroomMember::class);
    }

    /**
     * Notes shared in this classroom.
     */
    public function notes(): HasMany
    {
        return $this->hasMany(Note::class);
    }

    /**
     * Check if classroom is active.
     */
    public function isActive(): bool
    {
        return $this->status === 'active';
    }

    /**
     * Check if join policy is open.
     */
    public function isOpenJoin(): bool
    {
        return $this->join_policy === 'open';
    }

    /**
     * Check if join policy is code.
     */
    public function isCodeJoin(): bool
    {
        return $this->join_policy === 'code';
    }

    /**
     * Check if join policy is approval.
     */
    public function isApprovalJoin(): bool
    {
        return $this->join_policy === 'approval';
    }
}
