<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * TicketParticipant Model
 *
 * Defines access control for tickets.
 * Tracks who can see/access/reply to each ticket.
 *
 * @property int $id
 * @property int $ticket_id
 * @property int $user_id
 * @property string $role Permission role
 */
class TicketParticipant extends Model
{
    use HasFactory;

    /**
     * Mass assignable attribute
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'ticket_id',
        'user_id',
        'role'
    ];

    /**
     * Relationship: Participant is a User
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Relationship: Participant belongs to Ticket
     */
    public function ticket()
    {
        return $this->belongsTo(Ticket::class);
    }
}
