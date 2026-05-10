<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BookRequestResource extends JsonResource
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
            'buyer' => new UserResource($this->whenLoaded('buyer')),
            'school' => new SchoolResource($this->whenLoaded('school')),
            'title' => $this->title,
            'isbn' => $this->isbn,
            'subject' => $this->subject,
            'grade' => $this->grade,
            'track' => $this->track,
            'max_price' => $this->max_price,
            'description' => $this->description,
            'status' => $this->status,
            'created_at' => $this->created_at->toIso8601String(),
            'updated_at' => $this->updated_at->toIso8601String(),
        ];
    }
}
