<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * Software Model
 *
 * Represents a software license.
 * Can be assigned to multiple users.
 *
 * @property int $id
 * @property string $name
 * @property string $category
 * @property string|null $version
 * @property string|null $license_key
 * @property string|null $licence_expiry
 * @property string $status
 * @property string|null $notes
 */
class Software extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'category',
        'version',
        'license_key',
        'license_expiry',
        'status',
        'notes',
    ];

    protected $casts = [
        'licence_expiry' => 'date',
    ];

    /**
     * Relationship: Software  is assigned to many Users
     */
    public function users()
    {
        return $this->belongsToMany(User::class, 'user_software')
            ->withPivot('assigned_at')
            ->withTimestamps();
    }

    /**
     * Check if license is expired
     */
    public function isExpired(): bool
    {
        return $this->licence_expiry !== null
            && $this->licence_expiry->isPast();
    }
}
