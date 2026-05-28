<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * TicketHistory Model
 *
 * Audit trail for ticket changes.
 * Immutable record for compliance and tracking.
 *
 * @property int $id
 * @property int $ticket_id
 * @property int $changed_by  User who made the change
 * @property string $action_type Type of change
 * @property array|null $ old_values Previous state
 * @property array|null $ new_values New state
 * @property \Carbon\Carbon $created_at
 */
class TicketHistory extends Model
{
    use HasFactory;

    /**
     * Mass assignable attributes
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'ticket_id',
        'changed_by',
        'action_type',
        'old_values',
        'new_values',
    ];

    /**
     * Attribute casting
     *
     * JSON fields for storing state changes
     *
     * @var array<string, string>
     */
    protected $casts = [
        'old_values' => 'json',
        'new_values' => 'json',
    ];

    /**
     * Immutable - no update timestamp
     */
    public $timestamps = false;
    protected array $dates = ['created_at'];

    /**
     * Relationship: History belongs to Ticket
     */
    public function ticket()
    {
        return $this->belongsTo(Ticket::class);
    }

    /**
     * Relationship: History belongs to User (who made the change)
     */
    public function changedBy()
    {
        return $this->belongsTo(User::class);
    }
}
