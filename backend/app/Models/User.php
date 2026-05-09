<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'school_id',
        'grade',
        'track',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    /**
     * The school the user belongs to.
     */
    public function school(): BelongsTo
    {
        return $this->belongsTo(School::class);
    }

    /**
     * Books the user is selling.
     */
    public function books(): HasMany
    {
        return $this->hasMany(Book::class, 'seller_id');
    }

    /**
     * Book requests the user has made.
     */
    public function bookRequests(): HasMany
    {
        return $this->hasMany(BookRequest::class, 'buyer_id');
    }

    /**
     * Classrooms owned by the user.
     */
    public function ownedClassrooms(): HasMany
    {
        return $this->hasMany(Classroom::class, 'owner_id');
    }

    /**
     * Classroom memberships.
     */
    public function classroomMemberships(): HasMany
    {
        return $this->hasMany(ClassroomMember::class);
    }

    /**
     * Notes authored by the user.
     */
    public function notes(): HasMany
    {
        return $this->hasMany(Note::class, 'author_id');
    }

    /**
     * Conversation memberships.
     */
    public function conversationMemberships(): HasMany
    {
        return $this->hasMany(ConversationMember::class);
    }

    /**
     * Messages sent by the user.
     */
    public function messages(): HasMany
    {
        return $this->hasMany(Message::class, 'sender_id');
    }

    /**
     * Reports made by the user.
     */
    public function reports(): HasMany
    {
        return $this->hasMany(Report::class, 'reporter_id');
    }

    /**
     * Check if user is admin.
     */
    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    /**
     * Check if user is teacher.
     */
    public function isTeacher(): bool
    {
        return $this->role === 'teacher';
    }

    /**
     * Check if user is student.
     */
    public function isStudent(): bool
    {
        return $this->role === 'student';
    }
}
