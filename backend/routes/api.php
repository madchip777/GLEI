<?php

use App\Http\Controllers\Api\HardwareController;
use App\Http\Controllers\Api\PasswordController;
use App\Http\Controllers\Api\SoftwareController;
use App\Http\Controllers\Api\TicketController;
use App\Http\Controllers\Api\TwoFactorController;
use App\Http\Controllers\Api\UserController;
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

Route::get('/test-email', function () {
    $user = \App\Models\User::first();

    // Test USerCreatedMail
    \Illuminate\Support\Facades\Mail::to($user->email)
        ->send(new \App\Mail\UserCreatedMail($user, 'temporaryPassword123'));

    // Tes PasswordResetMAil - reset link
    \Illuminate\Support\Facades\Mail::to($user->email)
        ->send(new \App\Mail\PasswordResetMail($user, 'http://localhost:5173/reset-password?token=abc123'));

    // Test PasswordResetMail - admin reset
    \Illuminate\Support\Facades\Mail::to($user->email)
        ->send(new \App\Mail\PasswordResetMail($user, null, 'NewTemporaryPassword123'));

    return response()->json(['message' => 'All test email sent! Check Mailpit at http://localhost:8025']);
});

/**
 * === Public Routes (no authentification required) ===
 */
Route::post('/login', [AuthController::class, 'login']);
Route::post('/refresh', [AuthController::class, 'refresh']);
Route::post('password/forgot', [PasswordController::class, 'forgot']);
Route::post('password/reset', [PasswordController::class, 'reset']);

/**
 * === Semi-public 2FA routes ===
 */
Route::post('/2fa/verify', [TwoFactorController::class, 'verify']);
Route::post('/2fa/confirm', [TwoFactorController::class, 'confirm']);
Route::get('/2fa/setup', [TwoFactorController::class, 'setup']);

/**
 * === Protected Routes (authentification required) ===
 */
Route::middleware('auth:sanctum')->group(function () {
    // --- Auth endpoints ---
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);

    // --- Own profile - accessible to all authenticated users ---
    Route::get('/profile', [UserController::class, 'profile']);

    // --- User dashboard (accessible by all authenticated users) ---
    Route::get('/dashboard', [UserDashboardController::class, 'dashboard']);

    // Ticket operation (all authenticated users)
    Route::prefix('tickets')->group(function () {
        Route::post('/', [TicketController::class, 'store']);
        Route::get('/', [TicketController::class, 'index']);
        Route::get('/{id}', [TicketController::class, 'show']);
        Route::post('/{id}/submit', [TicketController::class, 'submit']);

        // Messages (nested under tickets)
        Route::post('/{id}/messages', [TicketController::class, 'addMessage']);
        Route::post('/{id}/messages/{msgId}/image', [TicketController::class, 'uploadImage']);

        // Images serving (protected, with access control)
        Route::get('/{id}/images/{imageId}/view', [TicketController::class, 'viewImageById']);
    });

    // --- Hardware management (admin and super_admin) ---
    Route::middleware('role:admin,super_admin')->group(function () {
        Route::get('/hardware', [HardwareController::class, 'index']);
        Route::post('/hardware', [HardwareController::class, 'store']);
        Route::get('/hardware/{id}', [HardwareController::class, 'show']);
        Route::put('/hardware/{id}', [HardwareController::class, 'update']);
        Route::delete('/hardware/{id}', [HardwareController::class, 'destroy']);
        Route::post('/hardware/{id}/assign', [HardwareController::class, 'assign']);
        Route::post('/hardware/{id}/unassign', [HardwareController::class, 'unassign']);

        // Software management (admin and super_admin)
        Route::get('/software', [SoftwareController::class, 'index']);
        Route::post('/software', [SoftwareController::class, 'store']);
        Route::get('/software/{id}', [SoftwareController::class, 'show']);
        Route::put('/software/{id}', [SoftwareController::class, 'update']);
        Route::delete('/software/{id}', [SoftwareController::class, 'destroy']);
        Route::post('/software/{id}/assign', [SoftwareController::class, 'assign']);
        Route::post('/software/{id}/unassign', [SoftwareController::class, 'unassign']);
    });

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

    // --- User management (admin and super_admin) ---
    Route::middleware('role:admin,super_admin')->group(function () {
        Route::get('/users', [UserController::class, 'index']);
        Route::post('/users', [UserController::class, 'store']);
        Route::get('/users/{id}', [UserController::class, 'show']);
        Route::post('/users/{id}/reset-password', [UserController::class, 'resetPassword']);
    });

    // --- Password change - authenticated ---
    Route::post('/password/change', [PasswordController::class, 'change']);
});
