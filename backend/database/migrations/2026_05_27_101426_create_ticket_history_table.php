<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Ticket History Table Migration
     *
     * Immutable audit trail for every change made to a ticket.
     * old_values and new_values store the before/after state as JSON
     * so any field change (status, priority, assignment, etc.) is captured
     * without needing a column per attribute.
     *
     * Columns match TicketService::assignTicket() and updateStatus() which write:
     *   ticket_id, changed_by, action_type, old_values, new_values
     */
    public function up(): void
    {
        Schema::create('ticket_history', function (Blueprint $table) {
            $table->id();

            $table->foreignId('ticket_id')
                ->constrained('tickets')
                ->onDelete('cascade');

            // User who triggered the change (nullable for system-generated entries)
            $table->foreignId('changed_by')
                ->nullable()
                ->constrained('users')
                ->onDelete('set null');

            $table->enum('action_type', [
                'created',
                'status_changed',
                'assigned',
                'unassigned',
                'priority_changed',
                'category_changed',
            ]);

            // JSON snapshots of the changed fields before and after
            $table->json('old_values')->nullable();
            $table->json('new_values')->nullable();

            // Immutable: only creation timestamp
            $table->timestamp('created_at')->useCurrent();

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
        Schema::dropIfExists('ticket_history');
    }
};
