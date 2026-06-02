<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Ticket Images Table Migration
     *
     * Stores images uploaded within ticket messages.
     * Each message can have at most one image.
     * Stores both original and thumbnail file references.
     *
     * Columns match TicketService::uploadImage() which writes:
     *   message_id, original_filename, stored_filename, mime_type,
     *   file_size, thumbnail_filename, original_path, thumbnail_path,
     *   width, height
     */
    public function up(): void
    {
        Schema::create('ticket_images', function (Blueprint $table) {
            $table->id();

            $table->foreignId('message_id')
                ->constrained('ticket_messages')
                ->onDelete('cascade');

            // Original filename as uploaded by the user
            $table->string('original_filename');

            // Secure server-side filename (unique)
            $table->string('stored_filename');

            $table->string('mime_type', 100);
            $table->unsignedBigInteger('file_size'); // in bytes

            // Thumbnail (nullable: generated asynchronously)
            $table->string('thumbnail_filename')->nullable();
            $table->string('original_path', 500);
            $table->string('thumbnail_path', 500)->nullable();

            // Image dimensions in pixels
            $table->unsignedInteger('width')->nullable();
            $table->unsignedInteger('height')->nullable();

            $table->timestamps();

            $table->index('message_id');
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
