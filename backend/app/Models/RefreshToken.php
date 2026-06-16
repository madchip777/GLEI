<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

/**
 * RefreshToken Model
 *
 * Represents a refresh token for token-based authentication.
 * Refresh tokens are long-lived and used to obtain new access tokens.
 * Stored as SHA-256 hash for security.
 *
 * @property int $usesUniqueIds
 * @property int $user_id Foreign key to users table
 * @property string $token SHA-256 hashed token
 * @property \Carbon\Carbon $expires_at Token expiration timestamp
 * @property \Carbon\Carbon $created_at
 * @property \Carbon\Carbon $updated_at
 *
 * @property User $user  Related user
 * @property string $plain_token Plain text token (not stored in DB, only returned on generation)
 */
class RefreshToken extends Model
{
    use HasFactory;

    /**
     * Mass assignable attributes
     *
     * @var array array<int, string>
     */
    protected $fillable = [
        'user_id',
        'token',
        'expires_at',
    ];

    /**
     * Attribute casting
     *
     * expires_at: Cast to Carbo datetime for easy comparison
     *
     * @var array<string, string>
     */
    protected $casts = [
        'expires_at' => 'datetime',
    ];

    /**
     * Relationship: Refresh token belongs to a user
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Check if token is expired
     *
     * Compares expiration time with current time.
     *
     * @return bool True if token is expired
     */
    public function isExpired(): bool
    {
        return $this->expires_at->isPast();
    }

    /**
     * Generates a new refresh token for user
     *
     * Creates a new refresh token and deletes all existing tokens for the user.
     * This ensures only one valid refresh token per user (single session).
     *
     * Token generation:
     * 1. Generates 60-character random string
     * 2. Hash with SHA-256 and store in database
     * 3. Attach plain text to model (not saved) for return to client)
     *
     * @param User $user User to generate token for
     *
     * @return self RefreshToken instance with plain_token property
     */
    public static function generate(User $user): self
    {
        // Delete old refresh tokens for this user
        self::where('user_id', $user->id)->delete();

        $plainToken = Str::random(60);

        // Create and store hashed token in database
        $refreshToken = self::create([
            'user_id' => $user->id,
            'token' => hash('sha256', $plainToken),
            'expires_at' => now()->addDays(7),
        ]);

        // Attach plain text token to model (not saved to DB)
        // This is returned to client once, never stored
        $refreshToken->plain_token = $plainToken;

        return $refreshToken;
    }

    /**
     * Verify and retrieve refresh token
     *
     * Validates token exists, is not expired, and returns the model.
     * Automatically  deletes expired tokens for cleanup.
     *
     * @param string $token Plain text token from client
     *
     * @return self|null RefreshToken if valid, null if invalid/expired
     */
    public static function verify(string $token): ?self
    {
        $hashToken = hash('sha256', $token);

        $refreshToken = self::where('token', $hashToken)->first();

        // Token expired - delete and return null
        if (!$refreshToken || $refreshToken->isExpired()) {
            $refreshToken?->delete();
            return null;
        }

        return $refreshToken;
    }
}
