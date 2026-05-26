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
        'password' => 'hashed',
    ];

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
