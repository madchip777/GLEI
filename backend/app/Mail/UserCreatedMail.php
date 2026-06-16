<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

/**
 * UserCreatedMail
 *
 * Sent to a newly created user by an admin or super admin.
 * Contains temporary password and login instructions.
 * User will be forced to change password on first login
 */
class UserCreatedMail extends Mailable
{
    use Queueable, SerializesModels;

    /**
     * @param User $user - The newly created user
     * @param string $temporaryPassword - Auto-generated temporary password
     */
    public function __construct(
        public User $user,
        public string $temporaryPassword,
    )
    {}

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'GLEI Support - Your account has been created',
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.user-created',
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
}
