<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * Hardware Model
 *
 * Represents a physical hardware item.
 * Can be assigned to a user or sit in the pool.
 *
 * @property int $id
 * @property string $category
 * @property string $brand
 * @property string $model
 * @property string $serial_number
 * @property string|null $purchase_date
 * @property string $condition
 * @property string $status
 * @property int|null $assigned_to
 * @property string|null $assigned_at
 * @property string|null $notes
 */
class Hardware extends Model
{
    use HasFactory;

    protected $fillable = [
        'category',
        'brand',
        'model',
        'serial_number',
        'purchase_date',
        'condition',
        'status',
        'assigned_to',
        'assigned_at',
        'notes',
    ];

    protected $casts = [
        'assigned_at' => 'datetime',
        'purchase_date' => 'date',
    ];

    /**
     * Relationship: Hardware is assigned to a User
     */
    public function assignedUser()
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    /**
     * Check if hardware is currently assigned to a user
     */
    public function isAssigned(): bool
    {
        return $this->assigned_to !== null;
    }
}
