<?php

namespace App\Services;

use App\Models\User;
use App\Models\RefreshToken;
use App\Repositories\Interfaces\UserRepositoryInterface;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

/**
 * Authentification Service
 *
 * Handles all authentification business logic including:
 * - User login with token generation
 * - Token refresh mechanism
 * - User logout with token revocation
 *
 * Uses  repository pattern for data access and includes comprehensive logging for security auditing.
 */
class AuthService
{
    /**
     * User repository for data access
     *
     * @var UserRepositoryInterface
     */
    private UserRepositoryInterface $userRepository;

    /**
     * Constructor - Inject user repository
     *
     * @param UserRepositoryInterface $userRepository
     */
    public function __construct(UserRepositoryInterface $userRepository) {
        $this->userRepository = $userRepository;
    }

    /**
     * Authenticate user and return token
     *
     * Validates credentials, creates access token and refresh token.
     * Access token is short-lived for security, refresh token allows seamless renewal.
     *
     * @param string $email User's email address
     * @param string $password User's password (plain text)
     *
     * @returns array Contains user, access_token, refresh_token, expires_in
     *
     * @throws ValidationException If credentials are invalid
     */
    public function login(string $email, string $password): array
    {
        // Retrieve user  by email
        $user = $this->userRepository->findByEmail($email);

        // Verify user exists and password is correct
        if (!$user || !Hash::check($password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Les identifiants fournis sont incorrects.'],
            ]);
        }

        // Create access token
        $accessToken = $user->createToken(
            'access-token',
            ['*'],
            now()->addMinutes(15)
        )->plainTextToken;

        // Create refresh token
        $refreshToken = RefreshToken::generate($user);

        // Log successful login for security audit
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
     *
     * Validates refresh token and generates new access token.
     * This allows users to maintain their session without re-login as long as their refresh token is valid.
     *
     * @param string $refreshTokenString Refresh token from client
     *
     * @returns array Contains user, access_token, expires_in
     *
     * @throws \Nette\Schema\ValidationException If refresh token is invalid or expired
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

        // Log token refresh for security audit
        Log::info('Token refreshed', [
            'user_id' => $user->id,
            'ip' => request()->ip(),
        ]);

        return [
            'user' => $user,
            'access_token' => $accessToken,
            'expires_in' => 900, // 15 minutes in seconds
        ];
    }

    /**
     * Logout user and revoke all tokens
     *
     * Revokes both access tokens (Sanctum) and refresh tokens.
     * This ensures complete session termination across all devices.
     *
     * @param User $user Authenticated user to logout
     *
     * @return void
     */
    public function logout(User $user): void
    {
        // Revoke all access tokens (Sanctum personal access tokens)
        $user->tokens()->delete();

        // Revoke all refresh tokens
        RefreshToken::where('user_id', $user->id)->delete();

        // Log logout for security audit
        Log::info('User logged out', [
            'user_id' => $user->id,
            'email' => $user->email,
            'timestamp' => now(),
        ]);
    }

    /**
     * Get authenticated user information
     *
     * Simple pass-through method for consistency.
     * Can be extended to include additional user data processing.
     *
     * @param USer $user Authenticated user
     *
     * @return USer
     */
    public function getCurrentUser(User $user): User
    {
        return $user;
    }
}
