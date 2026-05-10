<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BookResource extends JsonResource
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
            'seller' => new UserResource($this->whenLoaded('seller')),
            'school' => new SchoolResource($this->whenLoaded('school')),
            'title' => $this->title,
            'isbn' => $this->isbn,
            'subject' => $this->subject,
            'grade' => $this->grade,
            'track' => $this->track,
            'publisher' => $this->publisher,
            'author' => $this->author,
            'condition' => $this->condition,
            'price' => $this->price,
            'description' => $this->description,
            'status' => $this->status,
            'images' => BookImageResource::collection($this->whenLoaded('images')),
            'created_at' => $this->created_at->toIso8601String(),
            'updated_at' => $this->updated_at->toIso8601String(),
        ];
    }
}
