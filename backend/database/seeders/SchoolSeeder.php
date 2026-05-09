<?php

namespace Database\Seeders;

use App\Models\School;
use Illuminate\Database\Seeder;

class SchoolSeeder extends Seeder
{
    public function run(): void
    {
        $schools = [
            [
                'code' => 'RMIS001',
                'name' => 'Liceo Scientifico Galileo Galilei',
                'city' => 'Roma',
                'province' => 'RM',
                'region' => 'Lazio',
                'country' => 'Italy',
                'school_type' => 'lyceum',
            ],
            [
                'code' => 'MIIS002',
                'name' => 'Liceo Classico Giuseppe Parini',
                'city' => 'Milano',
                'province' => 'MI',
                'region' => 'Lombardia',
                'country' => 'Italy',
                'school_type' => 'lyceum',
            ],
            [
                'code' => 'NATC003',
                'name' => 'Istituto Tecnico Industriale Fermi',
                'city' => 'Napoli',
                'province' => 'NA',
                'region' => 'Campania',
                'country' => 'Italy',
                'school_type' => 'technical',
            ],
            [
                'code' => 'TOIS004',
                'name' => 'Istituto Professionale Volta',
                'city' => 'Torino',
                'province' => 'TO',
                'region' => 'Piemonte',
                'country' => 'Italy',
                'school_type' => 'professional',
            ],
            [
                'code' => 'FIIS005',
                'name' => 'Liceo Scientifico Leonardo da Vinci',
                'city' => 'Firenze',
                'province' => 'FI',
                'region' => 'Toscana',
                'country' => 'Italy',
                'school_type' => 'lyceum',
            ],
        ];

        foreach ($schools as $school) {
            School::create($school);
        }
    }
}
