<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\PasswordResetMail;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

/**
 * PasswordController
 *
 * Handles password management:
 * - Forced password change on first login
 * - Self-service password change
 * - Self-service password reset via email link
 */
class PasswordController extends Controller
{
    /**
     * Change password (forced or voluntary)
     *
     * Validates new pass meets requirements:
     * - Minimum 12 characters
     * - At least 1 uppercase letter
     * - At least 1 number
     * - At least 1 special character
     * - Cannot reuse current password
     *
     * @route POST /api/password/change
     * @access authenticated
     */
    public function change(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'current_password' => 'required|string',
                'new_password' => [
                    'required',
                    'string',
                    'min:12',
                    'confirmed', // requires new_password_confirmation field
                    'regex:/[A-Z]/',      // at least 1 uppercase
                    'regex:/[0-9]/',      // at least 1 number
                    'regex:/[@$!%*?&#^()_\-+=\[\]{}|;:,.<>]/', // at least 1 special char
                ],
            ], [
                'new_password.min' => 'Password must be at least 12 characters.',
                'new_password.regex' => 'Password must contain at least one uppercase letter, one number, and one special character.',
                'new_password.confirmed' => 'Password confirmation does not match.',
            ]);

            $user = $request->user();

            // Verify current password
            if (!Hash::check($validated['current_password'], $user->password)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Your current password is incorrect.',
                ], 422);
            }

            // Prevent reusing current password
            if (Hash::check($validated['new_password'], $user->password)) {
                return response()->json([
                    'success' => false,
                    'message' => 'New password cannot be the same as your current password.',
                ], 422);
            }

            // Update password and clear force_password_change flag
            $user->update([
                'password' => Hash::make($validated['new_password']),
                'force_password_change' => false,
            ]);

            Log::info('Password changed', [
                'user_id' => $user->id,
                'forced' => $user->force_password_change,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Password changed successfully.',
                'data' => [
                    'user' => [
                        'id' => $user->id,
                        'name' => $user->name,
                        'email' => $user->email,
                        'role' => $user->role,
                        'force_password_change' => false,
                    ],
                ]
            ], 200);

        } catch (ValidationException $exception) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $exception->errors(),
            ], 422);
        } catch (\Exception $exception) {
            Log::error('Password change failed', [
                'user_id' => $request->user()->id,
                'error' => $exception->getMessage(),
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Password change failed',
            ], 500);
        }
    }

    /**
     * Request password reset link (self-service)
     * Sends email with reset token valid for 60 minutes
     *
     * @route POST /api/password/forgot
     * @access public
     */
    public function forgot(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'email' => 'required|string|email',
            ]);

            $user = User::where('email', $validated['email'])->first();

            // Always return success to prevent email enumeration
            if (!$user) {
                return response()->json([
                    'success' => true,
                    'message' => 'If this email exists, a password reset link has been sent.',
                ], 200);
            }

            // Generate reset token
            $token = Str::random(64);
            $expiredAt = now()->addMinutes(60);

            // Store token in cache
            Cache::put(
                'password_reset_' . $token,
                ['user_id' => $user->id, 'expired_at' => $expiredAt],
                $expiredAt
            );

            // Build reset link
            $resetLink = env('FRONTEND_URL') . '/reset-password?token=' . $token;

            // Send email
            Mail::to($user->email)
                ->send(new PasswordResetMail($user, $resetLink));

            Log::info('Password reset link sent', ['user_id' => $user->id]);

            return response()->json([
                'success' => true,
                'message' => 'If this email exists, a reset link has been sent.',
            ], 200);

        } catch (ValidationException $exception) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $exception->errors(),
            ], 422);
        } catch (\Exception $exception) {
            Log::error('Password reset failed', ['error' => $exception->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to process request.',
            ], 500);
        }
    }

    /**
     * Reset password using token from email link
     *
     * @route POST / api/password/reset
     * @access public
     */
    public function reset(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'token' => 'required|string',
                'new_password' => [
                    'required',
                    'string',
                    'min:12',
                    'confirmed',
                    'regex:/[A-Z]/',
                    'regex:/[0-9]/',
                    'regex:/[@$!%*?&#^()_\-+=\[\]{}|;:,.<>]/',
                ],
            ], [
                'new_password.min' => 'Password must be at least 12 characters.',
                'new_password.regex' => 'Password must contain at least one uppercase letter, one number, and one special character.',
                'new_password.confirmed' => 'Password confirmation does not match.',
            ]);

            // Verify token
            $data = Cache::get('password_reset_' . $validated['token']);

            if (!$data) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid or expired reset token. Please request a new one.',
                ], 422);
            }

            $user = User::findOrFail($data['user_id']);

            // Prevent reusing current password
            if (Hash::check($validated['new_password'], $user->password)) {
                return response()->json([
                    'success' => false,
                    'message' => 'New password cannot be the same as your current password.',
                ], 422);
            }

            // Update password
            $user->update([
                'password' => Hash::make($validated['new_password']),
                'force_password_change' => false,
            ]);

            // Delete used token
            Cache::forget('password_reset_' . $validated['token']);

            Log::info('Password reset successful', ['user_id' => $user->id]);

            return response()->json([
                'success' => true,
                'message' => 'Password reset successful. You can now log in.',
            ], 200);

        } catch (ValidationException $exception) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $exception->errors(),
            ], 422);

        } catch (\Exception $exception) {
            Log::error('Password reset failed', ['error' => $exception->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to reset password.',
            ], 500);
        }
    }
}
