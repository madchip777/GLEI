<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CategorySeeder extends Seeder
{
    /**
     * Categories created by Alice Martin (super_admin, id=1).
     */
    public function run(): void
    {
        DB::table('categories')->insert([
            ['name' => 'Probleme materiel', 'created_by' => 1, 'created_at' => now()->subDays(30)],
            ['name' => 'Incident securite', 'created_by' => 1, 'created_at' => now()->subDays(30)],
            ['name' => 'Demande acces',     'created_by' => 1, 'created_at' => now()->subDays(30)],
            ['name' => 'Logiciel',          'created_by' => 1, 'created_at' => now()->subDays(30)],
            ['name' => 'Reseau',            'created_by' => 1, 'created_at' => now()->subDays(30)],
            ['name' => 'Autre',             'created_by' => 1, 'created_at' => now()->subDays(30)],
        ]);
    }
}
