<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class AdminController extends Controller
{
    /**
     * Admin dashboard
     * Accessible by: admin, super_admin
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
                'stats' => [
                    'total_users' => 150,
                    'active_tickets' => 42,
                    'pending_incidents' => 8,
                ],
            ],
        ], 200);
    }

    /**
     * Manage users
     * Accessible by: admin, super_admin
     */
    public function manageUsers(Request $request): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => 'Liste des utilisateurs',
            'data' => [
                'users' => [
                    ['id' => 1, 'name' => 'Admin User', 'role' => 'admin'],
                    ['id' => 2, 'name' => 'John Doe', 'role' => 'user'],
                    ['id' => 3, 'name' => 'Jane Smith', 'role' => 'user'],
                ],
            ],
        ], 200);
    }
}
