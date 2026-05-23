<?php

namespace App\Services;

use App\Models\User;
use App\Models\RefreshToken;
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

        // Create access token (expires in 15 minutes)
        $accessToken = $user->createToken('access-token', ['*'], now()->addMinutes(15))->plainTextToken;

        // Create refresh token (expires in 7 days)
        $refreshToken = RefreshToken::generate($user);

        $token =$user->createToken('auth-token')->plainTextToken;

        Log::info('User logged in', [
            'user_id' => $user->id,
            'email' => $user->email,
            'ip' => request()->ip(),
            'timestamp' => now()->format('Y-m-d H:i:s'),
        ]);

        return [
            'user' => $user,
            'access_token' => $accessToken,
            'refresh_token' => $refreshToken->plain_token,
            'expires_in' => 900, // 15 minutes in seconds
        ];
    }

    /**
     * Refresh access token using refresh token
     */
    public function refresh(string $refreshTokenString): array
    {
        $refreshToken = RefreshToken::verify($refreshTokenString);

        if (!$refreshToken) {
            throw ValidationException::withMessages([
                'refresh_token' => ['Invalid or expired refresh token.'],
            ]);
        }

        $user = $refreshToken->user;

        // Revoke old access tokens
        $user->tokens()->delete();

        // Create new access token
        $accessToken = $user->createToken('access-token', ['*'], now()->addMinutes(15))->plainTextToken;

        Log::info('Token refreshed', [
            'user_id' => $user->id,
            'ip' => request()->ip(),
        ]);

        return [
            'user' => $user,
            'access_token' => $accessToken,
            'expires_in' => 900,
        ];
    }

    /**
     * Logout user (revoke tokens)
     */
    public function logout(User $user): void
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
