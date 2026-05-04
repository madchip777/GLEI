<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\UserDashboardController;
use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\SuperAdminController;

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
    // --- Auth endpoints ---
    Route::post('logout', [AuthController::class, 'logout']);
    Route::get('user', [AuthController::class, 'user']);

    // --- User dashboard (accessible by all authenticated users) ---
    Route::get('dashboard', [UserDashboardController::class, 'dashboard']);

    // --- Admin routes (accessible by admin and super_admin) ---
    Route::middleware('role:admin,super_admin')->prefix('admin')->group(function () {
        Route::get('/dashboard', [AdminController::class, 'dashboard']);
        Route::get('/users', [AdminController::class, 'manageUsers']);
    });

    // --- Super Admin routes (accessible by super_admin ONLY) ---
    Route::middleware('role:super_admin')->prefix('super-admin')->group(function () {
        Route::get('/dashboard', [SuperAdminController::class, 'dashboard']);
        Route::get('/system-config', [SuperAdminController::class, 'systemConfig']);
    });

    // TODO: Add more protected routes here (e.g. user profile, admin dashboard, etc.)
});
