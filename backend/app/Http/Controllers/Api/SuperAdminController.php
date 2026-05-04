<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SuperAdminController extends Controller
{
    /**
     * Super admin dashboard
     * Accessible by: super_admin only
     */
    public function dashboard(Request $request): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => 'Bienvenue sur le tableau de bord super administrateur',
            'data' => [
                'user' => [
                    'name' => $request->user()->name,
                    'role' => $request->user()->role,
                ],
                'system_stats' => [
                    'total_admins' => 5,
                    'total_users' => 150,
                    'system_health' => 'OK',
                    'uptime' => '99.9%',
                ],
            ],
        ], 200);
    }

    /**
     * System configuration
     * Accessible by: super_admin only
     */
    public function systemConfig(Request $request): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => 'Configuration système',
            'data' => [
                'settings' => [
                    'maintenance_mode' => false,
                    'api_rate_limit' => 1000,
                    'session_timeout' => 3600,
                ],
            ],
        ], 200);
    }
}
