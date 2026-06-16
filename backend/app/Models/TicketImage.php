<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * TicketImage Model
 *
 * Represents an image uploaded in a ticket message.
 * Stores both original and thumbnail references.
 * Tracks file metadata for validation and display.
 *
 * @property int $id
 * @property int $message_id
 * @property string $original_filename Original uploaded filename
 * @property string $stored_filename Hashed filename on server
 * @property string $mime_type File MIME type (e.g., image/jpeg)
 * @property int $file_size File size in bytes
 * @property string|null $thumbnail_filename Thumbnail filename
 * @property string $original_path Path to original file
 * @property int|null $thumbnail_path Path to thumbnail
 * @property int|null $width Image width in pixels
 * @property int|null $height Image height in pixels
 */
class TicketImage extends Model
{
    use HasFactory;

    /**
     * Mass assignable attributes
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'message_id',
        'original_filename',
        'stored_filename',
        'mime_type',
        'file_size',
        'thumbnail_filename',
        'original_path',
        'thumbnail_path',
        'width',
        'height',
    ];

    /**
     * Disable timestamps
     */
    public $timestamps = true;

    /**
     * Relationship: Image belongs to a TicketMessage
     */
    public function message()
    {
        return $this->belongsTo(TicketMessage::class, 'message_id');
    }

    /**
     * Get full URL to original image
     */
    public function getOriginalUrl(): string
    {
        return url('api/tickets/' . $this->message->ticket_id . '/messages/' . $this->message_id . '/image/view');
    }

    /**
     * Get full URL to thumbnail
     */
    public function getThumbnailUrl(): string
    {
        return url('api/tickets/' . $this->message->ticket_id . '/messages/' . $this->message_id . '/image/view');
    }

    /**
     * Append computed attributes to JSON
     */
    protected $appends = [
        'original_url',
        'thumbnail_url',
    ];

    /**
     * Accessor: original_url
     */
    public function getOriginalUrlAttribute(): string
    {
        return $this->getOriginalUrl();
    }


    /**
     * Accessor: thumbnail_url
     */
    public function getThumbnailUrlAttribute(): string
    {
        return $this->getThumbnailUrl();
    }
}
