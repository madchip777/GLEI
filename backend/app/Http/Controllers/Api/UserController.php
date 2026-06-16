<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\PasswordResetMail;
use App\Models\User;
use App\Models\Hardware;
use App\Models\Software;
use App\Mail\UserCreatedMail;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules\Password;
use Illuminate\Validation\ValidationException;

/**
 * UserController
 *
 * Handles user management:
 * - Admin can create users
 * - Super admin can create admins and users
 * - List users
 * - View user profile with equipment
 * - Admin reset password
 */
class UserController extends Controller
{
    /**
     * Generate a secure temporary password
     * Meets requirements: 12 chars, uppercase, number, special char
     */
    private function generateTemporaryPassword(): string
    {
        $uppercase = strtoupper(Str::random(3));
        $lowercase = Str::random(4);
        $numbers = rand(100, 999);
        $special = Str::password(2, false, false, true);

        // Combine and s shuffle
        $password = str_shuffle($uppercase . $lowercase . $numbers . $special);

        // Ensure minimum length of 12
        while (strlen($password) < 12) {
            $password .= rand(0, 9);
        }

        return $password;
    }

    /**
     * Create a new user account
     * Admin can create users only
     * Super admin cqn create admins and users
     *
     * @rout POST /api/users
     * @access admin, super_admin
     */
    public function store(Request $request): JsonResponse
    {
        try {
            // Determine allowed users based on creator's role
            $allowedRoles = ['user'];
            if ($request->user()->isSuperAdmin()) {
                $allowedRoles[] = 'admin';
            }

            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'email' => 'required|string|email|unique:users,email',
                'role' => 'required|string|in:' . implode(',', $allowedRoles),
                'department' => 'nullable|string|max:255',
                'job_title' => 'nullable|string|max:255',
                'phone' => 'nullable|string|max:20',
                'hardware_ids' => 'nullable|array',
                'hardware_ids.*' => 'exists:hardware,id',
                'software_ids' => 'nullable|array',
                'software_ids.*' => 'exists:software,id',
            ]);

            // Generate temporary password
            $temporaryPassword = $this->generateTemporaryPassword();

            // Create user
            $user = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' => Hash::make($temporaryPassword),
                'role' => $validated['role'],
                'department' => $validated['department'] ?? null,
                'job_title' => $validated['job_title'] ?? null,
                'phone' => $validated['phone'] ?? null,
                'force_password_change' => true,
            ]);

            // Assign hardware if provided
            if (!empty($validated['hardware_ids'])) {
                Hardware::whereIn('id', $validated['hardware_ids'])
                    ->update([
                        'assigned_to' => $user->id,
                        'assigned_at' => now(),
                        'status' => 'active',
                    ]);
            }

            // Assign software if provided
            if (!empty($validated['software_ids'])) {
                $user->software()->attach(
                    $validated['software_ids'],
                    ['assigned_at' => now()]
                );
            }

            // Send welcome email with temporary password
            Mail::to($user->email)->send(new UserCreatedMail($user, $temporaryPassword));

            Log::info("User account created", [
                'created_by' => $request->user()->id,
                'new_user_id' => $user->id,
                'role' => $user->role,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'User created successfully. Login credentials sent by email',
                'data' => [
                    'user' => [
                        'id' => $user->id,
                        'name' => $user->name,
                        'email' => $user->email,
                        'role' => $user->role,
                        'department' => $user->department,
                        'job_title' => $user->job_title,
                        'phone' => $user->phone,
                    ]
                ]
            ], 201);
        } catch (ValidationException $exception) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $exception->errors(),
            ], 422);
        } catch (\Exception $exception) {
            Log::error('User creation failed', [
                'error' => $exception->getMessage(),
                'created_by' => $request->user()->id,
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to create user: ' . $exception->getMessage(),
            ], 500);
        }
    }

    /**
     * List all users
     * Admins see users only
     * Super admins see everyone
     *
     * @rout GET /api/users
     * @access admin, super_admin
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $query = User::with(['hardware', 'software']);

            // Admins can see users, not other admins
            if ($request->user()->isAdmin()) {
                $query->where('role', 'user');
            }

            $users = $query->orderBy('name')->get()->map(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role,
                    'department' => $user->department,
                    'job_title' => $user->job_title,
                    'phone' => $user->phone,
                    'force_password_change' => $user->force_password_change,
                    'two_factor_enabled' => $user->hasTwoFactorEnabled(),
                    'hardware_count' => $user->hardware->count(),
                    'software_count' => $user->software->count(),
                ];
            });

            return response()->json([
                'success' => true,
                'data' => ['users' => $users],
            ], 200);
        } catch (\Exception $exception) {
            Log::error('Failed to list users', [
                'error' => $exception->getMessage(),
                'requested_by' => $request->user()->id,
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve users: ' . $exception->getMessage(),
            ], 500);
        }
    }

    /**
     * Get a single user profile with equipment
     *
     * @route Get /api/users/{id}
     * @access admin, super_admin
     */
    public function show(Request $request, int $id): JsonResponse
    {
        try {
            $user = User::with(['hardware', 'software'])->findOrFail($id);

            // Admins cannot view other admins or super admins
            if ($request->user()->isAdmin() && !$user->isUser()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Access denied',
                ], 403);
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'user' => [
                        'id' => $user->id,
                        'name' => $user->name,
                        'email' => $user->email,
                        'role' => $user->role,
                        'department' => $user->department,
                        'job_title' => $user->job_title,
                        'phone' => $user->phone,
                        'force_password_change' => $user->force_password_change,
                        'two_factor_enabled' => $user->hasTwoFactorEnabled(),
                        'hardware' => $user->hardware,
                        'software' => $user->software,
                    ],
                ],
            ], 200);
        } catch (ModelNotFoundException $exception) {
            return response()->json([
                'success' => false,
                'message' => 'User not found',
            ], 404);
        } catch (\Exception $e) {
            Log::error('Failed to get user', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve user',
            ], 500);
        }
    }

    /**
     * Admin resets a user's password
     * Generates new temporary password, sends email,
     * forces password change on next login
     *
     * @route POST /api/users/{id}/reset-password
     * @access admin, super_admin
     */
    public function resetPassword(Request $request, int $id): JsonResponse
    {
        try {
            $user = User::findOrFail($id);

            // Admins can only reset users, not other admins
            if ($request->user()->isAdmin() && !$user->isUser()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Access denied',
                ], 403);
            }

            // Generate new temporary password
            $temporaryPassword = $this->generateTemporaryPassword();

            $user->update([
                'password' => Hash::make($temporaryPassword),
                'force_password_change' => true,
            ]);

            // Send reset email
            Mail::to($user->email)->send(
                new PasswordResetMail($user, null, $temporaryPassword)
            );

            Log::info('Admin reset user password', [
                'reset_by' => $request->user()->id,
                'user_id' => $user->id,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Password reset successfully. New temporary password sent by email.',
                ], 200);
        } catch (ModelNotFoundException $exception) {
            return response()->json([
                'success' => false,
                'message' => 'User not found',
            ], 404);
        } catch (\Exception $exception) {
            Log::error('Failed to reset password', ['error' => $exception->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to reset password',
            ], 500);
        }
    }

    /**
     * Get current user's own profile with equipment
     *
     * @route GET /api/profile
     * @access all authenticated users
     */
    public function profile(Request $request): JsonResponse
    {
        try {
            $user = User::with(['hardware', 'software'])->findOrFail($request->user()->id);

            return response()->json([
                'success' => true,
                'data' => [
                    'user' => [
                        'id' => $user->id,
                        'name' => $user->name,
                        'email' => $user->email,
                        'role' => $user->role,
                        'department' => $user->department,
                        'job_title' => $user->job_title,
                        'phone' => $user->phone,
                        'force_password_change' => $user->force_password_change,
                        'two_factor_enabled' => $user->hasTwoFactorEnabled(),
                        'hardware' => $user->hardware,
                        'software' => $user->software,
                    ],
                ],
            ], 200);
        } catch (\Exception $e) {
            Log::error('Failed to get profile', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve profile',
            ], 500);
        }
    }

    /**
     * List admin and super_admin users for ticket assignment
     *
     * @route GET /api/admins
     * @access admin, super_admin
     */
    public function listAdmins(Request $request): JsonResponse
    {
        try {
            $admins = User::whereIn('role', ['admin', 'super_admin'])
                ->orderBy('name')
                ->get()
                ->map(fn($u) => [
                    'id' => $u->id,
                    'name' => $u->name,
                    'email' => $u->email,
                    'role' => $u->role,
                ]);

            return response()->json([
                'success' => true,
                'data' => ['admins' => $admins],
            ], 200);
        } catch (\Exception $e) {
            Log::error('Failed to list admins', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve admins',
            ], 500);
        }
    }
}
