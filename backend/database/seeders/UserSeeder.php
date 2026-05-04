<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // Create super admin user
        User::create([
            'name' => 'Super Admin User',
            'email' => 'superadmin@company.com',
            'password' => Hash::make('password123'),
            'role' => 'super_admin',
        ]);

        // Create admin user
        User::create([
            'name' => 'Admin User',
            'email' => 'admin@company.com',
            'password' => Hash::make('password123'),
            'role' => 'admin',
        ]);

        // Create regular users
        User::create([
            'name' => 'John Doe',
            'email' => 'user@company.com',
            'password' => Hash::make('password123'),
            'role' => 'user',
        ]);

        User::create([
            'name' => 'Jane Smith',
            'email' => 'jane@company.com',
            'password' => Hash::make('password123'),
            'role' => 'user',
        ]);
    }
}
