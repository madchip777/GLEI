<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * TicketMessage Model
 *
 * Represents a message in ticket chat.
 * Immutable - no edit/delete after creation.
 * Can contain images (one per message).
 *
 * @property int $id
 * @property int $ticket_id
 * @property int $user_id Message author
 * @property string $content Message text
 * @property string $type Message type (text|system)
 * @property \Carbon\Carbon $created_at
 */
class TicketMessage extends Model
{
    use HasFactory;

    /**
     * Mass assignable attributes
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'ticket_id',
        'user_id',
        'content',
        'type',
        'created_at',
    ];

    /**
     * Immutable - disable timestamps update
     * Message never change after creation
     */
    public $timestamps = false;
    protected $casts = ['created_at'];

    /**
     * Only created_at timestamp
     */
    protected array $dates = ['created_at'];

    /**
     * Relationship: Message belongs to Ticket
     */
    public function ticket()
    {
        return $this->belongsTo(Ticket::class);
    }

    /**
     * Relationship: Message belongs to User (author)
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Relationship: Message has one image attachment (optional)
     */
    public function images()
    {
        return $this->hasMany(TicketImage::class, 'message_id');
    }
}
