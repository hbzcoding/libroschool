<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Report extends Model
{
    /** @use HasFactory<\Database\Factories\ReportFactory> */
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'reporter_id',
        'target_type',
        'target_id',
        'reason',
        'status',
    ];

    /**
     * The user who made the report.
     */
    public function reporter(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reporter_id');
    }

    /**
     * Get the target entity (polymorphic).
     */
    public function target()
    {
        return $this->morphTo();
    }

    /**
     * Check if report is open.
     */
    public function isOpen(): bool
    {
        return $this->status === 'open';
    }

    /**
     * Check if report is reviewed.
     */
    public function isReviewed(): bool
    {
        return $this->status === 'reviewed';
    }

    /**
     * Check if report is dismissed.
     */
    public function isDismissed(): bool
    {
        return $this->status === 'dismissed';
    }
}
