<?php

namespace App\Repositories\Interfaces;

use App\Models\User;

/**
 * User Repository Interface
 *
 * Defines contract for user data access operations.
 * Implements repository pattern for abstraction between business logic and data layer.
 *
 * This allows:
 * - Easy switching between data sources (DB, API, mock)
 * - Better testability (can mock repository)
 * - Single Responsibility Principle adherence
 */
interface UserRepositoryInterface
{
    /**
     * Find user by email address
     *
     * Used primarily for authentication.
     * Email is unique in the system.
     *
     * @param string $email User's email address
     *
     * @return User|null User model if found, null otherwise
     */
    public function findByEmail(string $email): ?User;

    /**
     * Find user by ID
     *
     * Used for retrieving user details after authentication
     * or for user management operations.
     *
     * @param int $id User's primary key
     *
     * @return User|null User model if found, null otherwise
     */
    public function findById(int $id): ?User;
}
