<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class NoteResource extends JsonResource
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
            'author' => new UserResource($this->whenLoaded('author')),
            'school' => new SchoolResource($this->whenLoaded('school')),
            'classroom' => new ClassroomResource($this->whenLoaded('classroom')),
            'title' => $this->title,
            'subject' => $this->subject,
            'grade' => $this->grade,
            'content' => $this->content,
            'visibility' => $this->visibility,
            'mode' => $this->mode,
            'permitted_users' => $this->when(
                $this->visibility === 'specific_users' && $this->relationLoaded('permissions'),
                UserResource::collection($this->permissions->pluck('user'))
            ),
            'created_at' => $this->created_at->toIso8601String(),
            'updated_at' => $this->updated_at->toIso8601String(),
        ];
    }
}