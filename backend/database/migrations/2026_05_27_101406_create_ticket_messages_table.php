<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Ticket Messages Table Migration
     *
     * Stores chat messages within tickets.
     * Immutable - no edit/delete for audit trail.
     */
    public function up(): void
    {
        Schema::create('ticket_messages', function (Blueprint $table) {
            $table->id();

            // Foreign key to tickets table
            $table->foreignId('ticket_id')->constrained()->onDelete('cascade');

            // Foreign key to users table (message author)
            $table->foreignId('user_id')->constrained()->onDelete('cascade');

            // Message content
            $table->text('content'); // Message text

            // Message type (for future extensibility)
            $table->enum('type', ['text', 'system'])->default('text');

            $table->timestamps();

            // Indexes
            $table->index('ticket_id'); // Find messages for a ticket
            $table->index('user_id'); // Find messages by user
            $table->index('created_at'); // Order by creation
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ticket_messages');
    }
};
