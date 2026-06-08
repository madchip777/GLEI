<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $users = [
            [
                'name' => 'Super Admin',
                'email' => 'superadmin@company.com',
                'password' => Hash::make('password123'),
                'role' => 'super_admin',
                'department' => 'Direction',
                'job_title' => 'System Administrator',
                'phone' => '+33 6 00 00 00 01',
                'force_password_change' => false,
            ],
            [
                'name' => 'Admin User',
                'email' => 'admin@company.com',
                'password' => Hash::make('password123'),
                'role' => 'admin',
                'department' => 'IT',
                'job_title' => 'IT Manager',
                'phone' => '+33 6 00 00 00 02',
                'force_password_change' => false,
            ],
            [
                'name' => 'John Doe',
                'email' => 'user@company.com',
                'password' => Hash::make('password123'),
                'role' => 'user',
                'department' => 'Development',
                'job_title' => 'Developer',
                'phone' => '+33 6 00 00 00 03',
                'force_password_change' => false,
            ],
            [
                'name' => 'Jane Doe',
                'email' => 'jane@company.com',
                'password' => Hash::make('password123'),
                'role' => 'user',
                'department' => 'HR',
                'job_title' => 'HR Manager',
                'phone' => '+33 6 00 00 00 04',
                'force_password_change' => false,
            ],
            [
                'name' => 'Bob Martin',
                'email' => 'bob@company.com',
                'password' => Hash::make('password123'),
                'role' => 'user',
                'department' => 'Finance',
                'job_title' => 'Accountant',
                'phone' => '+33 6 00 00 00 05',
                'force_password_change' => false,
            ],
        ];

        foreach ($users as $userData) {
            User::updateOrCreate(
                ['email' => $userData['email']],
                $userData
            );
        }

        $this->command->info('Users seeded: ' . count($users));
    }
}
