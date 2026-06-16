<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * Ticket Model
 *
 * Represents a support ticket for IT issues, security incidents, etc.
 * Tracks status, assignment, and participants.
 *
 * @property int $id
 * @property int $user_id Creator user ID
 * @property int|null $assigned_to Assigned user ID
 * @property string $title Short ticket title
 * @property string $description Full description
 * @property string $category Ticket category
 * @property string $status Ticket status
 * @property string $priority Priority level
 * @property \Carbon\Carbon $created_at
 * @property \Carbon\Carbon $updated_at
 */
class Ticket extends Model
{
    use HasFactory;

    /**
     * Mass assigned attributes
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'assigned_to',
        'title',
        'description',
        'category',
        'status',
        'priority',
    ];

    /**
     * Relationship: Ticket belongs to creator (User)
     */
    public function creator()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Relationship: Ticket belongs to assigned user
     */
    public function assignedTo()
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    /**
     * Relationship: Ticket has many messages
     */
    public function messages()
    {
        return $this->hasMany(TicketMessage::class);
    }

    /**
     * Relationship: Ticket has many participants
     */
    public function participants()
    {
        return $this->hasMany(TicketParticipant::class);
    }

    /**
     * Relationship: Ticket has many history records
     */
    public function history()
    {
        return $this->hasMany(TicketHistory::class);
    }

    /**
     * Get all users who can access this ticket
     */
    public function accessibleUsers()
    {
        return $this->participants()->with('user');
    }

    /**
     * Check if user can access this ticket
     *
     * @param User $user
     * @return bool
     */
    public function canAccess(User $user): bool
    {
        // Admins can access all tickets
        if ($user->isAdmin() || $user->isSuperAdmin()) {
            return true;
        }

        // Check if user is participant
        return $this->participants()
            ->where('user_id', $user->id)
            ->exists();
    }


    /**
     * Check if user can reply to this ticket
     *
     * @param User $user
     * @return bool
     */
    public function canReply(User $user): bool
    {
        // Creator can reply if not closed
        if ($this->user_id === $user->id && $this->status !== 'closed') {
            return true;
        }

        // Assigned admin can reply anytime
        if ($this->assigned_to === $user->id) {
            return true;
        }

        // Other admins can reply
        if ($user->isAdmin() || $user->isSuperAdmin()) {
            return true;
        }

        return false;
    }
}
