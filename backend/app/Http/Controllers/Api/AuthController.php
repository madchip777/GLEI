<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\AuthService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Log;

/**
 * Authentication Controller
 *
 * Handles HTTP request for authentication endpoints.
 * All methods return standardized JSON responses.
 *
 * Endpoints:
 * - POST /api/login - User authentication
 * - POST /api/refresh - Token refresh
 * - POST /api/logout - User logout (require auth)
 * - GET /api/user - Get current user (require auth)
 */
class AuthController extends Controller
{
    public function __construct(
        private readonly AuthService $authService
    ) {}

    /**
     * Login endpoint
     * POST /api/login
     */
    public function login(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => 'required|string|email',
            'password' => 'required|string|min:6',
        ]);

        try {
            $result = $this->authService->login(
                $validated['email'],
                $validated['password']
            );

            return response()->json([
                'success' => true,
                'message' => 'Connexion réussie',
                'data' => [
                    'user' => [
                        'id' => $result['user']->id,
                        'name' => $result['user']->name,
                        'email' => $result['user']->email,
                        'role' => $result['user']->role,
                    ],
                    'access_token' => $result['access_token'],
                    'refresh_token' => $result['refresh_token'],
                    'token_type' => 'Bearer',
                    'expires_in' => $result['expires_in'],
                ],
            ], 200);
        } catch (ValidationException $exception) {
            return response()->json([
                'success' => false,
                'message' => 'Échec de connexion',
                'errors' => $exception->errors(),
            ], 422);
        } catch (\Exception $exception) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur inattendue lors de la connexion : ' . $exception->getMessage(),
            ], 500);
        }
    }

    /**
     * Refresh token endpoint
     * POST /api/refresh
     */
    public function refresh(Request $request): JsonResponse
    {
        Log::info('Refresh endpoint hit', [
            'has_refresh_token' => $request->has('refresh_token'),
            'refresh_token' => $request->input('refresh_token') ? substr($request->input('refresh_token'), 0, 20) . '...' : null,
        ]);

        $validated = $request->validate([
            'refresh_token' => 'required|string',
        ]);

        try {
            $result = $this->authService->refresh($validated['refresh_token']);

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
            return response()->json([
                'success' => false,
                'message' => 'Error refreshing token',
            ], 500);
        }
    }

    /**
     * Logout endpoint
     * POST /api/logout
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
     * Get current authenticated user
     * Get /api/user
     */
    public function user(Request $request): JsonResponse
    {
        Log::info('=== User Endpoint Debug ===');
        Log::info('Headers:', $request->headers->all());
        Log::info('Authorization header:', [$request->header('Authorization')]);
        Log::info('Bearer token:', [$request->bearerToken()]);
        Log::info('Auth check:', [
            'is_authenticated' => auth('sanctum')->check(),
            'user_id' => auth('sanctum')->id(),
        ]);

        // Try to get user TODO remove debug
        $user = $request->user();
        Log::info('Request user:', ['user' => $user]);

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
