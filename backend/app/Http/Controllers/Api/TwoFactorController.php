<?php

namespace App\Http\Controllers\Api;


use App\Http\Controllers\Controller;
use App\Models\RefreshToken;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use PragmaRX\Google2FA\Google2FA;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;

/**
 * TwoFactorController
 *
 * Handles mandatory TOTP-based 2FA for all users.
 *
 * Flow:
 * 1. Login -> if no 2FA setup -> return setup_token
 * 2. GET /2fa/setup -> return QR code
 * 3. POST /2fa/confirm -> activates 2FA, return real tokens
 * 4. Subsequent logins -> return temp_token
 * 5. POST /2fa/verify -> verify code, return real tokens
 */
class TwoFactorController extends Controller
{
    private Google2FA $google2fa;

    public function __construct()
    {
        $this->google2fa = new Google2FA();
    }

    /**
     * Get QR code for 2FA setup
     * Requires setup_token from login response
     */
    public function setup(Request $request): JsonResponse
    {
        $setupToken = $request->header('X-setup-token');

        if (!$setupToken) {
            return response()->json(['message' => 'Setup token required'], 401);
        }

        $userId = Cache::get('2fa_setup_' . $setupToken);

        if (!$userId) {
            return response()->json(['message' => 'Invalid or expired token'], 401);
        }

        $user = User::findOrFail($userId);

        // Generate secret if not already generated
        if (!$user->two_factor_secret) {
            $secret = $this->google2fa->generateSecretKey();
            $user->update(['two_factor_secret' => $secret]);
        }

        // Generate QR code URL
        $qrCodeUrl = $this->google2fa->getQRCodeUrl(
            config('app.name'),
            $user->email,
            $user->two_factor_secret
        );

        Log::info('2FA setup initiated', ['user_id' => $user->id]);

        return response()->json([
            'success' => true,
            'data' => [
                'qr_code_url' => $qrCodeUrl,
                'secret' => $user->two_factor_secret,
                'email' => $user->email,
            ]
        ]);
    }

    /**
     * Confirm 2FA setup with first TOTP code
     * Activates 2FA and returns real auth tokens
     */
    public function confirm(Request $request): JsonResponse
    {
        $request->validate([
            'code' => 'required|string|size:6',
        ]);

        $setupToken = $request->header('X-Setup-Token');

        if (!$setupToken) {
            return response()->json(['message' => 'Setup token required'], 401);
        }

        $userId = Cache::get('2fa_setup_' . $setupToken);

        if (!$userId) {
            return response()->json(['message' => 'Invalid or expired token'], 401);
        }

        $user = User::findOrFail($userId);

        //Verify the code

        $valid = $this->google2fa->verifyKey(
            $user->two_factor_secret,
            $request->code
        );

        if (!$valid) {
            Log::warning(
                '2FA setup confirmation failed',
                ['user_id' => $user->id]
            );
            return response()->json(['message' => 'Invalid code. please check your authenticator app'], 422);
        }

        // Activate 2FA
        $user->update(['two_factor_confirmed_at' => now()]);

        // Clear setup token
        Cache::forget('2fa_setup_' . $setupToken);

        // Issue real tokens
        [$accessToken, $refreshToken] = $this->issueTokens($user);

        Log::info('2FA setup completed', ['user_id' => $user->id]);

        return response()->json([
            'success' => true,
            'message' => '2FA enabled successfully',
            'data' => [
                'access_token' => $accessToken,
                'refresh_token' => $refreshToken,
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role,
                    'force_password_change' => $user->force_password_change,
                ],
            ]
        ]);
    }

    /**
     * Verify TOTP code during login
     * Requires temp_token from login response
     */
    public function verify(Request $request): JsonResponse
    {
        $request->validate([
            'code' => 'required|string|size:6',
        ]);

        $tempToken = $request->header('X-Temp-Token');

        if (!$tempToken) {
            return response()->json(['message' => 'Temp token required'], 401);
        }

        $userId = Cache::get('2fa_temp_' . $tempToken);

        if (!$userId) {
            return response()->json(['message' => 'Invalid or expired token'], 401);
        }

        $user = User::findOrFail($userId);

        $valid = $this->google2fa->verifyKey(
            $user->two_factor_secret,
            $request->code
        );

        if (!$valid) {
            Log::warning('2FA verification failed', ['user_id' => $user->id]);
            return response()->json([
                'success' => false,
                'message' => 'Invalid code. Please try again.',
            ], 422);
        }

        // Clear temp token
        Cache::forget('2fa_temp_' . $tempToken);

        // Issue real tokens
        [$accessToken, $refreshToken] = $this->issueTokens($user);

        Log::info('2FA verified, user logged in', ['user_id' => $user->id]);

        return response()->json([
            'success' => true,
            'data' => [
                'access_token' => $accessToken,
                'refresh_token' => $refreshToken,
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role,
                    'force_password_change' => $user->force_password_change,
                ],
            ]
        ]);
    }

    /**
     * Issue access and refresh tokens for user
     */
    private function issueTokens(User $user): array
    {
        $accessToken = $user->createToken('access-token', ['*'], now()->addMinutes(15))->plainTextToken;

        $refreshTokenModel = RefreshToken::generate($user);
        $refreshToken = $refreshTokenModel->plain_token;

        return [$accessToken, $refreshToken];
    }
}
