<?php

namespace App\Repositories;

use App\Models\User;
use App\Repositories\Interfaces\UserRepositoryInterface;

class MockUSerRepository implements UserRepositoryInterface
{
    private array $users;

    public function __construct()
    {
        // Mock users - matching your database structure
        $this->users = [
            [
                'id' => 1,
                'name' => 'Admin User',
                'email' => 'admin@company.com',
                'password' => bcrypt('password123'), // Hashed
                'role' => 'admin',
            ],
            [
                'id' => 2,
                'name' => 'John Doe',
                'email' => 'user@company.com',
                'password' => bcrypt('password123'),
                'role' => 'user',
            ],
            [
                'id' => 3,
                'name' => 'Jane Smith',
                'email' => 'jane@company.com',
                'password' => bcrypt('password123'),
                'role' => 'user',
            ],
        ];
    }

    public function findByEmail(string $email): ?User
    {
        $userData = collect($this->users)->firstWhere('email', $email);

        if (!$userData)
        {
            return null;
        }

        return $this->hydrate($userData);
    }

    public function findById(string $id): ?User
    {
        $userData = collect($this->users)->firstWhere('id', $id);

        if (!$userData)
        {
            return null;
        }

        return $this->hydrate($userData);
    }

    private function hydrate(array $data): User
    {
        $user = new User();
        $user->id = $data['id'];
        $user->name = $data['name'];
        $user->email = $data['email'];
        $user->password = $data['password'];
        $user->role = $data['role'];
        $user->exists = true;

        return $user;
    }
}
