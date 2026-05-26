<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

/**
 * Role-Based Access Control (RBAC) Middleware
 *
 * Checks if authenticated user has required role(s) to access a route.
 * Supports multiple roles per route (OR logic).
 *
 * Usage in routes:
 * Route::middleware('role:admin,super_admin')->group(...)
 *
 * Logs all access attempts for security auditing.
 */
class CheckRole
{
    /**
     * Handle an incoming request.
     *
     * Verifies user is authenticated and has one of the required roles.
     * Logs access for security audit trail.
     *
     * @param Request $request HTTP request
     * @param Closure $next Next middleware
     * @param string ...$roles Required roles for access
     *
     * @return Response
     * - Passes to next middleware if authorized
     * - Returns 401 JSON if not authenticated
     * - Returns 403 JSON if authenticated but wrong role
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        // Check if the user is authenticated*
        // Should already be handled by auth:sanctum but double-check for security
        if (!$request->user()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 401);
        }

        // Check if user has one of the required roles
        if (!in_array($request->user()->role, $roles)) {
            return response()->json([
                'success' => false,
                'message' => 'Accès refusé. Permission insuffisantes.',
                'required_roles' => $roles,
                'your_role' => $request->user()->role,
            ], 403);
        }

        // Log successful role-protected access for security audit
        Log::info('Role-Protected route accessed', [
            'user_id' => $request->user()->id,
            'role' => $request->user()->role,
            'route' => $request->path(),
            'ip' => $request->ip(),
        ]);

        return $next($request);
    }
}
