<?php

namespace App\Services;

use App\Models\Classroom;
use App\Models\ClassroomMember;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ClassroomService
{
    /**
     * Create a new classroom with owner membership.
     */
    public function create(array $data, User $creator): Classroom
    {
        return DB::transaction(function () use ($data, $creator) {
            // Generate join code
            $data['join_code'] = $this->generateJoinCode();
            $data['owner_id'] = $creator->id;

            // Generate name if not provided
            if (empty($data['name'])) {
                $data['name'] = $this->generateClassroomName($data);
            }

            $classroom = Classroom::create($data);

            // Create owner membership
            $classroom->members()->create([
                'user_id' => $creator->id,
                'role' => 'owner',
                'status' => 'active',
            ]);

            return $classroom;
        });
    }

    /**
     * Update classroom settings.
     */
    public function update(Classroom $classroom, array $data): Classroom
    {
        $classroom->update($data);
        $classroom->refresh();

        return $classroom;
    }

    /**
     * Delete classroom.
     */
    public function delete(Classroom $classroom): void
    {
        $classroom->delete();
    }

    /**
     * Join a classroom.
     */
    public function join(Classroom $classroom, User $user): ClassroomMember
    {
        return DB::transaction(function () use ($classroom, $user) {
            // Check for existing membership
            $existingMember = $classroom->members()
                ->where('user_id', $user->id)
                ->first();

            if ($existingMember) {
                if ($existingMember->status === 'banned') {
                    throw new \Exception('You have been banned from this classroom.');
                }

                if ($existingMember->status === 'active') {
                    throw new \Exception('You are already a member of this classroom.');
                }

                // Reactivate pending member
                $existingMember->update(['status' => 'active']);
                return $existingMember;
            }

            // Create new membership
            return $classroom->members()->create([
                'user_id' => $user->id,
                'role' => 'member',
                'status' => 'active',
            ]);
        });
    }

    /**
     * Join a classroom by code.
     * Returns an array with classroom and membership.
     */
    public function joinByCode(string $joinCode, User $user): array
    {
        $classroom = Classroom::where('join_code', $joinCode)
            ->where('status', 'active')
            ->first();

        if (!$classroom) {
            throw new \Exception('Invalid or expired join code.');
        }

        if ($classroom->join_policy === 'approval') {
            // Create or update pending membership for approval
            $member = $classroom->members()->updateOrCreate(
                ['user_id' => $user->id],
                ['role' => 'member', 'status' => 'pending']
            );
            $classroom->load(['school', 'owner']);
            return ['classroom' => $classroom, 'member' => $member];
        }

        $member = $this->join($classroom, $user);
        $classroom->load(['school', 'owner']);

        return ['classroom' => $classroom, 'member' => $member];
    }

    /**
     * Leave a classroom.
     */
    public function leave(Classroom $classroom, User $user): void
    {
        $member = $classroom->members()
            ->where('user_id', $user->id)
            ->where('status', 'active')
            ->first();

        if (!$member) {
            throw new \Exception('You are not a member of this classroom.');
        }

        if ($member->role === 'owner') {
            throw new \Exception('Owner cannot leave the classroom. Transfer ownership or delete the classroom instead.');
        }

        $member->delete();
    }

    /**
     * Update member role.
     */
    public function updateMemberRole(Classroom $classroom, User $targetUser, string $role): ClassroomMember
    {
        return DB::transaction(function () use ($classroom, $targetUser, $role) {
            $member = $classroom->members()
                ->where('user_id', $targetUser->id)
                ->where('status', 'active')
                ->first();

            if (!$member) {
                throw new \Exception('User is not an active member of this classroom.');
            }

            if ($member->role === 'owner') {
                throw new \Exception('Cannot change the role of the owner.');
            }

            $member->update(['role' => $role]);

            return $member;
        });
    }

    /**
     * Remove a member from classroom.
     */
    public function removeMember(Classroom $classroom, User $targetUser): void
    {
        $member = $classroom->members()
            ->where('user_id', $targetUser->id)
            ->first();

        if (!$member) {
            throw new \Exception('User is not a member of this classroom.');
        }

        if ($member->role === 'owner') {
            throw new \Exception('Cannot remove the owner from the classroom.');
        }

        $member->delete();
    }

    /**
     * Regenerate join code.
     */
    public function regenerateJoinCode(Classroom $classroom): string
    {
        $newCode = $this->generateJoinCode();
        $classroom->update(['join_code' => $newCode]);

        return $newCode;
    }

    /**
     * Generate a unique join code.
     */
    private function generateJoinCode(): string
    {
        do {
            $code = strtoupper(Str::random(6));
        } while (Classroom::where('join_code', $code)->exists());

        return $code;
    }

    /**
     * Generate classroom name from data.
     */
    private function generateClassroomName(array $data): string
    {
        $parts = [
            $data['grade'] ?? '',
            $data['section'] ?? '',
        ];

        $name = trim(implode('', array_filter($parts)));

        if (!empty($data['track'])) {
            $name .= ' - ' . $data['track'];
        }

        $name .= ' (' . ($data['academic_year'] ?? '') . ')';

        return $name;
    }
}
