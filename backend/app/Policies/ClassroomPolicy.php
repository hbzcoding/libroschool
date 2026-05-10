<?php

namespace App\Policies;

use App\Models\Classroom;
use App\Models\User;

class ClassroomPolicy
{
    /**
     * Determine whether the user can view the classroom list.
     * Anyone can view public classrooms. Authenticated users can see all active classrooms they have access to.
     */
    public function viewAny(?User $user): bool
    {
        return true;
    }

    /**
     * Determine whether the user can view the classroom.
     * Public classrooms are visible to everyone (including guests).
     * Private classrooms are visible only to members.
     */
    public function view(?User $user, Classroom $classroom): bool
    {
        if ($classroom->isPublic()) {
            return true;
        }

        // Private classrooms require authentication
        if (!$user) {
            return false;
        }

        return $classroom->hasMember($user->id);
    }

    /**
     * Determine whether the user can create classrooms.
     * Authenticated users can create classrooms.
     */
    public function create(User $user): bool
    {
        return true;
    }

    /**
     * Determine whether the user can update the classroom.
     * Only the owner can update classroom settings.
     */
    public function update(User $user, Classroom $classroom): bool
    {
        return $classroom->isOwnedBy($user->id);
    }

    /**
     * Determine whether the user can delete the classroom.
     * Only the owner can delete the classroom.
     */
    public function delete(User $user, Classroom $classroom): bool
    {
        return $classroom->isOwnedBy($user->id);
    }

    /**
     * Determine whether the user can join the classroom.
     * Authenticated users can join open classrooms.
     * For code/approval policy classrooms, they must use joinByCode.
     */
    public function join(User $user, Classroom $classroom): bool
    {
        if (!$classroom->isActive()) {
            return false;
        }

        if ($classroom->hasMember($user->id)) {
            return false;
        }

        return true;
    }

    /**
     * Determine whether the user can leave the classroom.
     * Members can leave (except owner).
     */
    public function leave(User $user, Classroom $classroom): bool
    {
        $member = $classroom->getMember($user->id);

        if (!$member) {
            return false;
        }

        return $member->role !== 'owner';
    }

    /**
     * Determine whether the user can view members.
     * Only classroom members can view the member list.
     */
    public function viewMembers(User $user, Classroom $classroom): bool
    {
        return $classroom->hasMember($user->id);
    }

    /**
     * Determine whether the user can manage member roles.
     * Only owner or moderators can change roles.
     * Owner is always excluded from role changes.
     */
    public function manageMembers(User $user, Classroom $classroom): bool
    {
        return $classroom->isModeratedBy($user->id);
    }

    /**
     * Determine whether the user can remove members.
     * Only the owner can remove members.
     */
    public function removeMember(User $user, Classroom $classroom): bool
    {
        return $classroom->isOwnedBy($user->id);
    }

    /**
     * Determine whether the user can regenerate the join code.
     * Only owner or moderators can regenerate the join code.
     */
    public function regenerateJoinCode(User $user, Classroom $classroom): bool
    {
        return $classroom->isModeratedBy($user->id);
    }
}
