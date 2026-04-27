<?php

namespace App\Services;

use App\Models\User;
use App\Repositories\Interfaces\UserRepositoryInterface;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

class AuthService
{
    public function __construct(
        private UserRepositoryInterface $userRepository
    ) {}

    /**
     * Authenticate user and return token
     *
     * @throws ValidationException
     */
    public function login(string $email, string $password): array
    {
        $user = $this->userRepository->findByEmail($email);

        if (!$user || !Hash::check($password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Les identifiants fournis sont incorrects.'],
            ]);
        }

        $token =$user->createToken('auth-token')->plainTextToken;

        Log::info('User logged in', [
            'user_id' => $user->id,
            'email' => $user->email,
            'ip' => request()->ip(),
            'timestamp' => now()->format('Y-m-d H:i:s'),
        ]);

        return [
            'user' => $user,
            'token' => $token,
        ];
    }

    /**
     * Logout user (revoke tokens)
     */
    public function logout(USer $user): void
    {
        $user->tokens()->delete();

        Log::info('User logged out', [
            'user_id' => $user->id,
            'email' => $user->email,
            'timestamp' => now(),
        ]);
    }

    /**
     * Get authenticated user info
     */
    public function getCurrentUser(User $user): User
    {
        return $user;
    }
}
