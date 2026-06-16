<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

/**
 * User Dashboard Controller
 *
 * Handles user dashboard endpoint.
 * Accessible to all authenticated users regardless of role.
 *
 * Returns user information and their tickets.
 */
class UserDashboardController extends Controller
{
    /**
     * Get user dashboard data
     *
     * Returns authenticated user's information and tickets.
     * Currently returns mock data - TODO Replace with real database queries.
     *
     * @route GET /api/dashboard
     * @access Protected (requires auth:sanctum)
     *
     * @param Request $request HTTP request (user injected by  middleware)
     *
     * @return JsonResponse
     * - 200: Success with user data and tickets
     */
    public function dashboard(Request $request): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => 'Bienvenue sur votre tableau de bord',
            'data' => [
                'user' => [
                    'name' => $request->user()->name,
                    'email' => $request->user()->email,
                    'role' => $request->user()->role,
                ],
                // TODO: Replace with real database query
                // Example: $request->user()->tickets()->where('status', 'open')->get()
                'my_tickets' => [
                    ['id' => 1, 'title' => 'Problème réseau', 'status' => 'ouvert'],
                    ['id' => 2, 'title' => 'Demande accès', 'status' => 'en cours'],
                ],
            ]
        ], 200);
    }
}
