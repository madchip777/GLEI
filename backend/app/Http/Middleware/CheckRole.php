<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class CheckRole
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     * @param string ...$roles
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        // Check if the user is authenticated
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

        // Log access for security audit
        Log::info('Role-Protected route accessed', [
            'user_id' => $request->user()->id,
            'role' => $request->user()->role,
            'route' => $request->path(),
            'ip' => $request->ip(),
        ]);

        return $next($request);
    }
}
