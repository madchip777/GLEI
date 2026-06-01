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
     */
    public function up(): void
    {
        Schema::create('ticket_history', function (Blueprint $table) {
            $table->id('history_id');

            $table->foreignId('ticket_id')
                ->constrained('tickets', 'ticket_id')
                ->onDelete('cascade');

            // User who triggered the change
            $table->foreignId('user_id')
                ->constrained('users')
                ->onDelete('cascade');

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
            $table->index('user_id');
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
