<?php

namespace App\Services;

use App\Models\Ticket;
use App\Models\TicketMessage;
use App\Models\TicketImage;
use App\Models\TicketHistory;
use App\Models\TicketParticipant;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Pagination\Paginator;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

/**
 * Ticket Service
 *
 * Handles all ticket business logic including:
 * - Ticket creation and updates
 * - Message management
 * - Image uploads with thumbnails
 * - Access control
 * - History tracking
 *
 * Separates business logic from HTTP concerns (controllers).
 */
class TicketService
{
    /**
     * Image configuration constants
     */
    private const int|float MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
    private const array ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif'];
    private const int THUMBNAIL_WIDTH = 200;
    private const int THUMBNAIL_HEIGHT = 200;

    /**
     * Create a new ticket
     *
     * Creates ticket in 'draft' status with creator as participent.
     * Stores in history for audit trail.
     *
     * @param User $user Authenticated user creating ticket
     * @param array $data Ticket data (title, description, category, priority)
     *
     * @return Ticket Created ticket
     *
     * @throws ValidationException If data invalid
     */
    public function createTicket(User $user, array $data): Ticket
    {
        $ticket = Ticket::create([
            'user_id' => $user->id,
            'title' => $data['title'],
            'description' => $data['description'],
            'category' => $data['category'] ?? 'general',
            'priority' => $data['priority'] ?? 'medium',
            'status' => 'draft',
        ]);

        // Add creator as participant
        TicketParticipant::create([
            'ticket_id' => $ticket->id,
            'user_id' => $user->id,
            'role' => 'creator',
        ]);

        // Log creation
        TicketHistory::create([
            'ticket_id' => $ticket->id,
            'changed_by' => $user->id,
            'action_type' => 'created',
            'created_at' => now(),
            'new_values' => [
                'status' => 'draft',
                'title' => $data['title'],
                'category' => $data['category'] ?? 'general',
            ],
        ]);

        Log::info('Ticket created', [
            'ticket_id' => $ticket->id,
            'user_id' => $user->id,
            'category' => $data['category'] ?? 'general',
        ]);

        return $ticket;
    }

    /**
     * Submit a ticket (draft -> open)
     *
     * Changes ticket status from draft to open.
     * Only creator can submit their own draft.
     *
     * @param Ticket $ticket
     * @param USer $user Authenticated user
     *
     * @return Ticket Updated ticket
     *
     * @throws ValidationException If user not creator or ticket not draft
     */
    public function submitTicket(Ticket $ticket, User $user): Ticket
    {
        if($ticket->user_id !== $user->id) {
            throw ValidationException::withMessages([
                'ticket' => ['Only the creator can submit this ticket.'],
            ]);
        }

        if ($ticket->status !== 'draft') {
            throw ValidationException::withMessages([
                'status' => ['Only draft tickets can be submitted.'],
            ]);
        }

        // Update  status
        $oldStatus = $ticket->status;
        $ticket->update(['status' => 'open']);

        // Log status change
        TicketHistory::create([
            'ticket_id' => $ticket->id,
            'changed_by' => $user->id,
            'created_at' => now(),
            'action_type' => 'status_changed',
            'old_values' => ['status' => $oldStatus],
            'new_values' => ['status' => 'open'],
        ]);

        return $ticket;
    }

    /**
     * Add message to ticket
     *
     * Creates a message in ticket  chat.
     * USer must have access to tickets.
     *
     * @param Ticket $ticket
     * @param USer $user Message author
     * @param string $content Message text
     *
     * @return TicketMessage Created message
     *
     * @throws ValidationException If user can't reply
     */
    public function addMessage(Ticket $ticket, User $user, string $content): TicketMessage
    {
        if(!$ticket->canReply($user)) {
            throw ValidationException::withMessages([
                'message' => ['You cannot reply  to this ticket.'],
            ]);
        }

        $message = TicketMessage::create([
            'ticket_id' => $ticket->id,
            'user_id' => $user->id,
            'content' => $content,
            'type' => 'text',
            'created_at' => now(),
        ]);

        Log::info('Ticket message added', [
            'ticket_id' => $ticket->id,
            'message_id' => $message->id,
            'user_id' => $user->id,
        ]);

        return $message;
    }

    /**
     * Upload image to message
     *
     * Validates image, stores original and thumbnail.
     * Associates with ticket message.
     *
     * @param TicketMessage $message
     * @param UploadedFile $file Uploaded image file
     *
     * @return TicketImage Created image record
     *
     * @throws ValidationException If image invalid/too large
     */
    public function uploadImage(TicketMessage $message, $file): TicketImage
    {
        $this->validateImage($file);

        // Generates secure filenames
        $originalFilename = $file->getClientOriginalName();
        $storedFilename = uniqid() . '-' . time() . '.' . $file->getClientOriginalExtension();
        $thumbnailFilename = 'thumb_' . $storedFilename;

        // Store using configured disk
        $originalPath = $file->store('originals', 'ticket-images');
        $thumbnailPath = $this->generateThumbnail($originalPath, $thumbnailFilename);

        $imageStoragePath = env('IMAGE_STORAGE_PATH');
        $fullOriginalPath = $imageStoragePath . DIRECTORY_SEPARATOR . $originalPath;
        [$width, $height] = getimagesize($fullOriginalPath);

        // Create database record
        $image = TicketImage::create([
            'message_id' => $message->id,
            'original_filename' => $originalFilename,
            'stored_filename' => $storedFilename,
            'mime_type' => $file->getMimeType(),
            'file_size' => $file->getSize(),
            'thumbnail_filename' => $thumbnailFilename,
            'original_path' => $originalPath,
            'thumbnail_path' => $thumbnailPath,
            'width' => $width,
            'height' => $height,
        ]);

        Log::info('Ticket image uploaded', [
            'image_id' => $image->id,
            'message_id' => $message->id,
            'file_size' => $file->getSize(),
        ]);

        return $image;
    }

    /**
     * Validate image file
     *
     * Checks:
     * - File  is one of allowed MIME types
     * - File size under limit
     *
     * @param UploadedFile $file
     *
     * @throws ValidationException If validation fails
     */
    private function validateImage($file): void
    {
        // Check MIME type
        if (!in_array($file->getMimeType(), self::ALLOWED_IMAGE_TYPES)) {
            throw ValidationException::withMessages([
                'image' => ['Invalid image type. Allowed types: JPEG, PNG, GIF.'],
            ]);
        }

        // Chack file  size (5MB max)
        if ($file->getSize() > self::MAX_IMAGE_SIZE) {
            throw ValidationException::withMessages([
                'image' => ['Image must be smaller than 5MB.'],
            ]);
        }
    }

    /**
     * Generate thumbnail from image
     *
     * Creates 200x200 thumbnail for preview.
     * Uses GD library.
     *
     * @param string $originalPath Path to original image
     * @param string $thumbnailFilename Name for thumbnail
     *
     * @return string Path to stored thumbnail
     */
    private function generateThumbnail(string $originalPath, string $thumbnailFilename): string
    {
        $imageStoragePath = env('IMAGE_STORAGE_PATH');
        $originalFullPath = $imageStoragePath . DIRECTORY_SEPARATOR . $originalPath;

        $image = imagecreatefromstring(file_get_contents($originalFullPath));
        $originalWidth = imagesx($image);
        $originalHeight = imagesy($image);

        // Calculate aspect ratio and crop dimensions
        $aspectRatio = $originalWidth / $originalHeight;
        if ($aspectRatio > 1) {
            $cropHeight = $originalHeight;
            $cropWidth = $originalHeight;
            $cropX = ($originalWidth - $originalHeight) / 2;
            $cropY = 0;
        } else {
            $cropWidth = $originalWidth;
            $cropHeight = $originalHeight;
            $cropX = 0;
            $cropY = ($originalHeight - $originalWidth) / 2;
        }

        // Create square thumbnail
        $thumbnail = imagecreatetruecolor(self::THUMBNAIL_WIDTH, self::THUMBNAIL_HEIGHT);
        imagecopyresampled(
            $thumbnail, $image,
            0, 0,
            $cropX, $cropY,
            self::THUMBNAIL_WIDTH, self::THUMBNAIL_HEIGHT,
            $cropWidth, $originalHeight
        );

        // Serve thumbnail
        $thumbnailPath = 'thumbnails/' . DIRECTORY_SEPARATOR . $thumbnailFilename;
        $thumbnailFullPath = $imageStoragePath . DIRECTORY_SEPARATOR . $thumbnailPath;

        if (!is_dir(dirname($thumbnailFullPath))) {
            mkdir(dirname($thumbnailFullPath), 0755, true);
        }

        imagejpeg($thumbnail, $thumbnailFullPath, 85);
        unset($image);
        unset($thumbnail);

        return str_replace(DIRECTORY_SEPARATOR, '/', $thumbnailPath);
    }

    /**
     * Assign ticket to admin/support staff
     *
     * Updates assigned_to field and adds as participant.
     * Logs change for audit trail.
     *
     * @param Ticket $ticket
     * @param User $admin Admin/support staff
     * @param User $changedBy User making  the change
     *
     * @return Ticket Updated ticket
     */
    public function assignTicket(Ticket $ticket, User $admin, User $changedBy): Ticket
    {
        $oldAssignment = $ticket->assigned_to;

        $ticket->update(['assigned_to' => $admin->id]);

        // Add admin as participant if not already
        TicketParticipant::firstOrCreate(
            ['ticket_id' => $ticket->id, 'user_id' => $admin->id],
            ['role' => 'assigned']
        );

        TicketHistory::create([
            'ticket_id' => $ticket->id,
            'changed_by' => $changedBy->id,
            'action_type' => 'assigned',
            'created_at' => now(),
            'old_values' => ['assigned_to' => $oldAssignment],
            'new_values' => ['assigned_to' => $admin->id],
        ]);

        Log::info('Ticket assigned', [
            'ticket_id' => $ticket->id,
            'assigned_to' => $admin->id,
        ]);

        return $ticket;
    }

    /**
     * Update ticket status
     *
     * Changes status and logs history.
     * Only admins can change status (except creator submitting).
     *
     * @param Ticket $ticket
     * @param string $newStatus New status value
     * @param User $changedBy User making the change
     *
     * @return Ticket Updated ticket
     */
    public function updateStatus(Ticket $ticket, string $newStatus, User $changedBy): Ticket
    {
        $oldStatus = $ticket->status;

        // Update status
        $ticket->update(['status' => $newStatus]);

        // Log change
        TicketHistory::create([
            'ticket_id' => $ticket->id,
            'changed_by' => $changedBy->id,
            'action_type' => 'status_changed',
            'created_at' => now(),
            'old_values' => ['status' => $oldStatus],
            'new_values' => ['status' => $newStatus],
        ]);

        Log::info('Ticket status changed', [
            'ticket_id' => $ticket->id,
            'old_status' => $oldStatus,
            'new_status' => $newStatus,
        ]);

        return $ticket;
    }

    /**
     * Get ticket history for user
     *
     * Returns paginated list of tickets created by the user.
     * Includes most recent messages.
     *
     * @param USer $user
     * @param int $perPage Pagination limit
     *
     * @return Paginator
     */
    public function getUserTickets(User $user, int $perPage = 20)
    {
        return Ticket::where('user_id', $user->id)
            ->with('messages', 'assignedTo')
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);
    }

    /**
     * Get tickets accessible to user
     *
     * For admins: all tickets
     * For regular users: only their tickets
     *
     * @param User $user
     * @param int $perPage
     *
     * @return Paginator|LengthAwarePaginator
     */
    public function getAccessibleTickets(User $user, int $perPage = 20)
    {
        if ($user->isAdmin() || $user->isSuperAdmin()) {
            // Admins see all tickets
            return Ticket::with('creator', 'assignedTo', 'messages')
                ->orderBy('created_at', 'desc')
                ->paginate($perPage);
        }

        // Regular users see only their own tickets
        return $this->getUserTickets($user, $perPage);
    }
}
