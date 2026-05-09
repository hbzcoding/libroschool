<?php

namespace Database\Factories;

use App\Models\School;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<School>
 */
class SchoolFactory extends Factory
{
    protected $model = School::class;

    public function definition(): array
    {
        return [
            'code' => fake()->unique()->bothify('SCH####'),
            'name' => fake()->company() . ' High School',
            'city' => fake()->city(),
            'province' => fake()->stateAbbr(),
            'region' => fake()->state(),
            'country' => 'Italy',
            'school_type' => fake()->randomElement(['lyceum', 'technical', 'professional']),
        ];
    }
}
