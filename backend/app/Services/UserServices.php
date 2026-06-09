<?php

namespace App\Services;

use App\Models\User;
use App\Repositories\Interfaces\UserRepositoryInterface;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class UserServices
{
    protected $userRepository;

    public function __construct(UserRepositoryInterface $userRepository)
    {
        $this->userRepository = $userRepository;
    }

    /**
     * Get all users
     * 
     * @param int $perPage
     * 
     * @return LengthAwarePaginator
     */
    public function getAllUsers(int $perPage = 20)
    {
        return $this->userRepository->getAllUsers($perPage);
    }

    /**
     * Get user by id
     * 
     * @param int $id
     * 
     * @return User
     */
    public function getUserById(int $id)
    {
        return $this->userRepository->getUserById($id);
    }

    /**
     * Create user
     * 
     * @param array $data
     * 
     * @return User
     */
    public function createUser(array $data)
    {
        return $this->userRepository->createUser($data);
    }

    /**
     * Update user
     * 
     * @param int $id
     * @param array $data
     * 
     * @return User
     */
    public function updateUser(int $id, array $data)
    {
        return $this->userRepository->updateUser($id, $data);
    }

    /**
     * Delete user
     * 
     * @param int $id
     * 
     * @return bool
     */
    public function deleteUser(int $id)
    {
        return $this->userRepository->deleteUser($id);
    }

    /**
     * Search users
     * 
     * @param string $query
     * @param int $perPage
     * 
     * @return Paginator
     */
    public function searchUsers(string $query, int $perPage = 20)
    {
        return $this->userRepository->searchUsers($query, $perPage);
    }

    /**
     * Change password
     * 
     * @param int $userId
     * @param array $data
     * 
     * @return User
     */
    public function changePassword(int $userId, array $data)
    {
        $user = $this->userRepository->getUserById($userId);

        if (!$user) {
            throw ValidationException::withMessages([
                'user' => ['User not found.'],
            ]);
        }

        $user->password = Hash::make($data['password']);
        $user->save();

        return $user;
    }
}