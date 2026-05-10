<?php

namespace App\Policies;

use App\Models\Report;
use App\Models\User;

class ReportPolicy
{
    /**
     * Determine whether the user can create a report.
     * Only authenticated users can report content.
     */
    public function create(User $user): bool
    {
        return true;
    }

    /**
     * Determine whether the user can view any reports (admin only).
     */
    public function viewAny(User $user): bool
    {
        return $user->isAdmin();
    }

    /**
     * Determine whether the user can view a specific report (admin only).
     */
    public function view(User $user, Report $report): bool
    {
        return $user->isAdmin();
    }

    /**
     * Determine whether the user can resolve a report (admin only).
     */
    public function resolve(User $user, Report $report): bool
    {
        return $user->isAdmin();
    }
}