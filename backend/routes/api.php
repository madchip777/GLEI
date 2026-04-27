<?php

use App\Http\Controllers\Api\AuthController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

/**
 * === Public Routes (no authentification required) ===
 */
Route::post('login', [AuthController::class, 'login']);


/**
 * === Protected Routes (authentification required) ===
 */
Route::middleware('auth:sanctum')->group(function () {
    Route::post('logout', [AuthController::class, 'logout']);
    Route::get('user', [AuthController::class, 'user']);

    // TODO: Add more protected routes here (e.g. user profile, admin dashboard, etc.)
});
