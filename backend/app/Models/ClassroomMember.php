<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ClassroomMember extends Model
{
    /** @use HasFactory<\Database\Factories\ClassroomMemberFactory> */
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'classroom_id',
        'user_id',
        'role',
        'status',
    ];

    /**
     * The classroom this membership belongs to.
     */
    public function classroom(): BelongsTo
    {
        return $this->belongsTo(Classroom::class);
    }

    /**
     * The user who is a member.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Check if member is owner.
     */
    public function isOwner(): bool
    {
        return $this->role === 'owner';
    }

    /**
     * Check if member is moderator.
     */
    public function isModerator(): bool
    {
        return $this->role === 'moderator';
    }

    /**
     * Check if member is regular member.
     */
    public function isMember(): bool
    {
        return $this->role === 'member';
    }

    /**
     * Check if member is active.
     */
    public function isActive(): bool
    {
        return $this->status === 'active';
    }
}
