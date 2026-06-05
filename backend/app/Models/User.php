<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

/**
 * User Model
 *
 * Represents a user in the system with authentication capabilities.
 * Uses Laravel Sanctum for API token authentication.
 *
 * @property int $id
 * @property string $name
 * @property string $email
 * @property string $password Hashed password
 * @property string $role User role
 * @property \Carbon\Carbon $email_verified_at
 * @property \Carbon\Carbon $created_at
 * @property \Carbon\Carbon $updated_at
 * @property string|null $two_factor_secret Encrypted TOTP secret
 * @property \Carbon\Carbon|null $two_factor_confirmed_at When 2FA was confirmed
 * @property bool $force_password_change Must change password on next login
 */
class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * Mass assignable attributes
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'two_factor_secret',
        'two_factor_confirmed_at',
        'force_password_change',
    ];

    /**
     * Hidden attributes (not included in JSON responses)
     *
     * Passwords and tokens should never be exposed in API responses.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
        'two_factor_secret',
    ];

    /**
     * Attribute casting
     *
     * email_verified_at: Cast to Carbon datetime instance
     * password: Automatically hash when set (Laravel 10+)
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'two_factor_confirmed_at' => 'datetime',
        'force_password_change' => 'boolean',
        'password' => 'hashed',
    ];

    // 2FA checks

    /**
     * Check if user has completed 2FA setup
     */
    public function hasTwoFactorEnabled(): bool
    {
        return $this->two_factor_confirmed_at !== null;
    }

    /**
     * Check if user needs to set up 2FA
     */
    public function needsTwoFactorSetup(): bool
    {
        return $this->two_factor_secret === null || $this->two_factor_confirmed_at === null;
    }

    // === Role Checks ===

    /**
     * Chack if user is a super administrator
     *
     * Super admins have full system  access including:
     * - System configuration
     * - All admin capabilities
     * - USer management across all roles
     *
     * @return bool
     */
    public function isSuperAdmin(): bool
    {
        return $this->role === 'super_admin';
    }

    /**
     * Check if user is an administrator
     *
     * Admins have elevated privileges including:
     * - User management (non-admin users)
     * - Ticket and incident management
     * - System statistics access
     *
     * @return bool
     */
    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    /**
     * Check if user is a regular user
     *
     * Regular users have standard access:
     * - View own dashboard
     * - Create and manage own tickets
     * - View own incidents
     *
     * @return bool
     */
    public function isUser(): bool{
        return $this->role === 'user';
    }

    /**
     * Check if user has specific role
     *
     * Generic role checker for flexible authorization.
     * Useful for dynamic role checking in policies.
     *
     * @param string $role Role to check (user|admin|super_admin)
     *
     * @return bool
     */
    public function hasRole(string $role): bool
    {
        return $this->role === $role;
    }
}
