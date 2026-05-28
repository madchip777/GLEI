<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Ticket Images Table Migration
     *
     * Stores images uploaded in ticket messages.
     * Tracks original and thumbnail file paths.
     * Supports file size limits and format validation.
     */
    public function up(): void
    {
        Schema::create('ticket_images', function (Blueprint $table) {
            $table->id();

            // Foreign key to ticket_messages table
            $table->foreignId('message_id')->constrained('ticket_messages')->onDelete('cascade');

            // File information
            $table->string('original_filename'); // Original filename from upload
            $table->string('stored_filename'); // Stored filename (hashed for security)
            $table->string('mime_type'); // File type (image/jpeg, image/png, etc)
            $table->unsignedInteger('file_size'); // File size in bytes

            // Thumbnail
            $table->string('thumbnail_filename')->nullable(); // Thumbnail filename

            // Storage paths
            $table->string('original_path'); // Path to original file
            $table->string('thumbnail_path')->nullable(); // Path to thumbnail

            // Metadata
            $table->unsignedInteger('width')->nullable(); // Image width in pixels
            $table->unsignedInteger('height')->nullable(); // Image height in pixels

            $table->timestamps();

            // Indexes
            $table->index('message_id');
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ticket_images');
    }
};
