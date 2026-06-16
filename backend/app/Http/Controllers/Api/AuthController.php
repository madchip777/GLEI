<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\AuthService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

/**
 * Authentication Controller
 *
 * Handles HTTP request for authentication endpoints.
 * All methods return standardized JSON responses.
 *
 * Endpoints:
 * - POST /api/login - User authentication
 * - POST /api/refresh - Token refresh
 * - POST /api/logout - User logout (requires auth)
 * - GET /api/user - Get current user (requires auth)
 */
class AuthController extends Controller
{
    /**
     * Authentication service instance
     *
     * @var AuthService
     */
    private AuthService $authService;

    /**
     * Constructor - Inject authentication service
     *
     * @param AuthService $authService
     */
    public function __construct(AuthService $authService)
    {
        $this->authService = $authService;
    }

    /**
     * Login Endpoint
     *
     * Authenticates  user with email and password.
     * If 2FA not set yp: returns setup_token for 2FA enrollment.
     * If 2FA set up: returns temp_token for TOTP verification
     */
    public function login(Request $request): JsonResponse
    {
        // Validate request input
        $validated = $request->validate([
            'email' => 'required|string|email',
            'password' => 'required|string|min:6',
        ]);

        try {
            // Attempt authentication
            $result = $this->authService->login(
                $validated['email'],
                $validated['password']
            );

            $user = $result['user'];
            Log::info('User logged in', [
                'user_id' => $user->id,
                'email' => $user->email,
                'ip' => $request->ip(),
                'timestamp' => now()->toDateTimeString(),
            ]);

            // 2FA not yet set up -> send to setup flow
            if ($user->needsTwoFactorSetup()) {
                $setupToken = Str::random(64);
                Cache::put('2fa_setup_' . $setupToken, $user->id, now()->addMinutes(15));

                return response()->json([
                    'success' => true,
                    'requires_2fa_setup' => true,
                    'setup_token' => $setupToken,
                    'message' => 'Please set up two-factor authentication',
                ], 200);
            }

            // 2FA set up -> require TOTP code
            $tempToken = Str::random(64);
            Cache::put('2fa_temp_' . $tempToken, $user->id, now()->addMinutes(15));

            return response()->json([
                'success' => true,
                'requires_2fa' => true,
                'temp_token' => $tempToken,
                'message' => 'Please enter your authenticator code',
            ], 200);
        } catch (ValidationException $exception) {
            return response()->json([
                'success' => false,
                'message' => 'Échec de connexion',
                'errors' => $exception->errors(),
            ], 422);
        } catch (\Exception $exception) {
            // Unexpected error - log for debugging
            Log::error('Login exception', [
                'message' => $exception->getMessage(),
                'trace' => $exception->getTraceAsString(),
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Erreur inattendue lors de la connexion : ' . $exception->getMessage(),
            ], 500);
        }
    }

    /**
     * Refresh token Endpoint
     *
     * Generates new access token using refresh token.
     * Client sends refresh token, receives new access token.
     * Refresh token remains valid (not rotated).
     *
     * @route POST /api/refresh
     * @access Public (but requires valid refresh token)
     *
     * @param Request $request HTTP request with refresh_token
     *
     * @return JsonResponse
     * - 200: Success with new access token
     * - 401: Invalid or expired refresh token
     * - 500: Server error
     */
    public function refresh(Request $request): JsonResponse
    {
        Log::info('Refresh endpoint hit', [
            'has_refresh_token' => $request->has('refresh_token'),
            'refresh_token' => $request->input('refresh_token') ? substr((string) $request->input('refresh_token'), 0, 20) . '...' : null,
        ]);

        $validated = $request->validate([
            'refresh_token' => 'required|string',
        ]);

        try {
            // Attempt token refresh
            $result = $this->authService->refresh($validated['refresh_token']);

            // Return success response with new access token
            return response()->json([
                'success' => true,
                'message' => 'Token refreshed successfully',
                'data' => [
                    'user' => [
                        'id' => $result['user']->id,
                        'name' => $result['user']->name,
                        'email' => $result['user']->email,
                        'role' => $result['user']->role,
                    ],
                    'access_token' => $result['access_token'],
                    'token_type' => 'Bearer',
                    'expires_in' => $result['expires_in'],
                ],
            ], 200);
        } catch (ValidationException $exception) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid refresh token',
                'errors' => $exception->errors(),
            ], 401);
        } catch (\Exception $exception) {
            // Unexpected error - log for debugging
            Log::error('Token refresh exception', [
                'message' => $exception->getMessage(),
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Error refreshing token',
            ], 500);
        }
    }

    /**
     * Logout Endpoint
     *
     * Revokes all user tokens (access and refresh).
     * Requires authentication via access token.
     *
     * @route POST /api/logout
     * @access Protected (requires auth:sanctum)
     *
     * @param Request $request HTTP request (user injected by middleware)
     *
     * @return JsonResponse
     * - 200: Success
     * - 500: Server error
     */
    public function logout(Request $request): JsonResponse
    {
        try {
            $this->authService->logout($request->user());

            return response()->json([
                'success' => true,
                'message' => 'Déconnexion réussie',
            ], 200);
        } catch (\Exception $exception) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la connexion : ' . $exception->getMessage(),
            ], 500);
        }
    }

    /**
     * Get Current User Endpoint
     *
     * Returns authenticated user's information.
     * Requires authentication via access token.
     *
     * @route GET /api/user
     * @access Protected (requires auth:sanctum)
     *
     * @param Request $request HTTP request (user injected by middleware)
     *
     * @return JsonResponse
     * - 200: Success with user data
     * - 401: Not authenticated
     */
    public function user(Request $request): JsonResponse
    {
        $user = $request->user();

        // Sanity check (should never happen with auth middleware)
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'No user found - token invalid or missing',
            ], 401);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role,
                ],
            ],
        ], 200);
    }
}
