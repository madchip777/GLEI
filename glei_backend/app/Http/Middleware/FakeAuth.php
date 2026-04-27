<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class FakeAuth
{
    public function handle(Request $request, Closure $next)
    {
        $token = str_replace('Bearer ', '', $request->header('Authorization'));

        // fake tokens
        $validTokens = ['abc123', 'admin456'];

        if (!in_array($token, $validTokens)) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        return $next($request);
    }
}