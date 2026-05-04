<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\AuthService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Log;

class AuthController extends Controller
{
    public function __construct(
        private AuthService $authService
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
                    'token' => $result['token'],
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
