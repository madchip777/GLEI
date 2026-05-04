<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class UserDashboardController extends Controller
{
    /**
     * User dashboard
     * Accessible by all authenticated users
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
                'my_tickets' => [
                    ['id' => 1, 'title' => 'Problème réseau', 'status' => 'ouvert'],
                    ['id' => 2, 'title' => 'Demande accès', 'status' => 'en cours'],
                ],
            ]
        ], 200);
    }
}
