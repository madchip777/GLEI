<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Super Admin Dashboard Controller
 *
 * Handles super administrator dashboard endpoints.
 * Accessible to users with 'super_admin' role only.
 *
 * Provides:
 * - System-wide statistics
 * - System configuration management
 * - High-level metrics
 */
class SuperAdminController extends Controller
{
    /**
     * Get super admin dashboard
     *
     * Returns comprehensive system statistics for super administrators.
     * Currently returns mock data - TODO Replace with real queries.
     *
     * @route GET /api/super-admin/dashboard
     * @access Protected (requires auth:sanctum + role:super_admin)
     *
     * @param Request $request HTTP request (user injected by middleware)
     *
     * @return JsonResponse
     * - 200: Success with system statistics
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
                // TODO: Replace with real system metrics
                // Example:
                // 'total_admins' => User::where('role', 'admin')->count(),
                // 'system_health' => SystemHealth::check(),
                // 'uptime' => SystemMetrics::getUptime(),
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
     * Get system configuration
     *
     * Returns system configuration settings for management.
     * Currently returns mock data - TODO Replace with real config values.
     *
     * @route GET /api/super-admin/system-config
     * @access Protected (requires auth:sanctum + role:super_admin)
     *
     * @param Request $request HTTP request
     *
     * @return JsonResponse
     * - 200: Success with configuration
     */
    public function systemConfig(Request $request): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => 'Configuration système',
            'data' => [
                // TODO: Replace with real configuration values
                // Example: config('app.settings')
                'settings' => [
                    'maintenance_mode' => false,
                    'api_rate_limit' => 1000,
                    'session_timeout' => 3600,
                ],
            ],
        ], 200);
    }
}
