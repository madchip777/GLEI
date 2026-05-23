<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class RefreshToken extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'token',
        'expires_at',
    ];

    protected $casts = [
        'expires_at' => 'datetime',
    ];

    /**
     * Relationship with User
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Check if token is expired
     */
    public function isExpired(): bool
    {
        return $this->expires_at->isPast();
    }

    /**
     * Generate a new refresh token
     */
    public static function generate(User $user): self
    {
        // Delete old refresh tokens for this user
        self::where('user_id', $user->id)->delete();

        $plainToken = Str::random(60);

        $refreshToken = self::create([
            'user_id' => $user->id,
            'token' => hash('sha256', $plainToken),
            'expires_at' => now()->addDays(7),
        ]);

        $refreshToken->plain_token = $plainToken;

        return $refreshToken;
    }

    /**
     * Find token and verify it's valid
     */
    public static function verify(string $token): ?self
    {
        $refreshToken = self::where('token', hash('sha256', $token))->first();

        if (!$refreshToken || $refreshToken->isExpired()) {
            // Delete expired token
            $refreshToken?->delete();
            return null;
        }

        return $refreshToken;
    }
}
