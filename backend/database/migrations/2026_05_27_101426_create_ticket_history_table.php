<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Ticket History Table Migration
     *
     * Audit trail for ticket status changes, priority and assignments.
     * Immutable record compliance
     */
    public function up(): void
    {
        Schema::create('ticket_histories', function (Blueprint $table) {
            $table->id();

            // Foreign key to tickets table
            $table->foreignId('ticket_id')->constrained()->onDelete('cascade');

            // User who made the change
            $table->foreignId('changed_by')->constrained('users')->onDelete('cascade');

            // What changed
            $table->enum('action_type', [
                'created',      // Ticket created
                'status_changed', // Status changed
                'assigned',     // Assigned to user
                'unassigned',   // Unassigned from user
                'priority_changed', // Priority changed
                'category_changed'  // Category changed
            ]);

            // Previous and new values (JSON for flexibility)
            $table->json('old_values')->nullable(); // Previous state
            $table->json('new_values')->nullable(); // New state

            // Timestamp of change
            $table->timestamp('created_at');

            // Indexes
            $table->index('ticket_id');
            $table->index('changed_by');
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ticket_histories');
    }
};
