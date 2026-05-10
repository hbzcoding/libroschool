<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ClassroomResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'school' => new SchoolResource($this->whenLoaded('school')),
            'owner' => new UserResource($this->whenLoaded('owner')),
            'name' => $this->name,
            'description' => $this->description,
            'grade' => $this->grade,
            'section' => $this->section,
            'track' => $this->track,
            'academic_year' => $this->academic_year,
            'join_code' => $this->when(
                $this->shouldShowJoinCode($request->user()),
                $this->join_code
            ),
            'join_policy' => $this->join_policy,
            'visibility' => $this->visibility,
            'is_verified' => $this->is_verified,
            'status' => $this->status,
            'members_count' => $this->when(
                $this->members_count !== null,
                $this->members_count ?? $this->activeMembersCount()
            ),
            'created_at' => $this->created_at->toIso8601String(),
            'updated_at' => $this->updated_at->toIso8601String(),
        ];
    }

    /**
     * Determine if the join code should be shown to the user.
     */
    private function shouldShowJoinCode(?\Illuminate\Contracts\Auth\Authenticatable $user): bool
    {
        if (!$user) {
            return false;
        }

        // Get the actual user ID from the model
        $userId = $user->id;

        return $this->isModeratedBy($userId);
    }
}
