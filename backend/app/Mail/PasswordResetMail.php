<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

/**
 * PasswordResetMail
 */
class PasswordResetMail extends Mailable
{
    use Queueable, SerializesModels;

    /**
     * @param User $user - The user resetting their password
     * @param string|null $resetLink - Reset link for self-service flow
     * @param string|null $temporaryPassword - Temporary password for admin-initiated reset
     */
    public function __construct(
        public User $user,
        public ?string $resetLink = null,
        public ?string $temporaryPassword = null,
    )
    {}

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'GLEI Support - Password Reset',
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.password-reset',
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
}
