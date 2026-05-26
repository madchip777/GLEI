<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

/**
 * Admin Dashboard Controller
 *
 * Handles admin dashboard endpoints.
 * Accessible to users with 'admin' or 'super_admin' roles only.
 *
 * Provides:
 * - System statistics
 * - User management
 */
class AdminController extends Controller
{
    /**
     * Get admin dashboard statistics
     *
     * Returns system-wide statistics for administrators.
     * Currently returns mock data - TODO Replace with real queries.
     * @route GET /api/admin/dashboard
     * @access Protected (requires auth:sanctum + role:admin,super_admin)
     *
     * @param Request $request HTTP request (user injected by middleware)
     *
     * @return JsonResponse
     * - 200: Success with statistics
     */
    public function dashboard(Request $request): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => 'Bienvenue sur le tableau de bord administrateur',
            'data' => [
                'user' => [
                    'name' => $request->user()->name,
                    'role' => $request->user()->role,
                ],
                // TODO: Replace with real database aggregations
                // Example:
                // 'total_users' => User::count(),
                // 'active_tickets' => Ticket::where('status', 'open')->count(),
                // 'pending_incidents' => Incident::where('status', 'pending')->count(),
                'stats' => [
                    'total_users' => 150,
                    'active_tickets' => 42,
                    'pending_incidents' => 8,
                ],
            ],
        ], 200);
    }

    /**
     * Get user list for management
     *
     * Returns list of all users for admin management.
     * Currently returns mock data - TODO Replace with real query.
     *
     * @route GET /api/admin/users
     * @access Protected (requires auth:sanctum + role:admin,super_admin)
     *
     * @param Request $request HTTP request
     *
     * @return JsonResponse
     * - 200: Success with user list
     */
    public function manageUsers(Request $request): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => 'Liste des utilisateurs',
            'data' => [
                // TODO: Replace with real database query
                // Example: User::select('id', 'name', 'role')->get()
                'users' => [
                    ['id' => 1, 'name' => 'Admin User', 'role' => 'admin'],
                    ['id' => 2, 'name' => 'John Doe', 'role' => 'user'],
                    ['id' => 3, 'name' => 'Jane Smith', 'role' => 'user'],
                ],
            ],
        ], 200);
    }
}
