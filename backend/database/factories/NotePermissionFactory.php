<?php

namespace Database\Factories;

use App\Models\Note;
use App\Models\NotePermission;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<NotePermission>
 */
class NotePermissionFactory extends Factory
{
    protected $model = NotePermission::class;

    public function definition(): array
    {
        return [
            'note_id' => Note::factory(),
            'user_id' => User::factory(),
        ];
    }
}