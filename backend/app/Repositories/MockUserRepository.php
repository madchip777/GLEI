<?php

namespace App\Repositories;

use App\Models\User;
use App\Repositories\Interfaces\UserRepositoryInterface;

/**
 * Mock User Repository
 *
 * Database-backed implementation of UserRepositoryInterface.
 * Named "Mock" for historical reasons but uses real database.
 *
 * This implementation uses Eloquent ORM to query the users table.
 * Can be easily swapped with alternative implementations (cache, API, etc.)
 * without changing business logic.
 */
class MockUserRepository implements UserRepositoryInterface
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

    /**
     * Find user by email address
     *
     * Queries users rable for exact email match.
     * Email is unique constraint in database.
     *
     * @param string $email User's email address
     *
     * @return User|null USer model if found, null if not found
     */
    public function findByEmail(string $email): ?User
    {
        return User::where('email', $email)->first();
    }

    /**
     * Find user by primary key ID
     *
     * Uses Eloquent's find() method for efficient lookup.
     *
     * @param int $id User's primary key
     *
     * @return User|null User model if found, null if not found
     */
    public function findById(int $id): ?User
    {
        return User::find($id);
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
