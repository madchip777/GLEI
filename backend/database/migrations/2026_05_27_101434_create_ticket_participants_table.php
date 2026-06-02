<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Ticket Participants Table Migration
     *
     * Defines who can see and interact with each ticket.
     * Access control is enforced at the application layer using this table.
     *
     * Roles:
     *   creator  - original ticket creator (full access, can submit)
     *   assigned - admin/support staff assigned to the ticket (can respond, change status)
     *   viewer   - read-only access (e.g. a manager added for visibility)
     */
    public function up(): void
    {
        Schema::create('ticket_participants', function (Blueprint $table) {
            $table->foreignId('ticket_id')
                ->constrained('tickets')
                ->onDelete('cascade');

            $table->foreignId('user_id')
                ->constrained('users')
                ->onDelete('cascade');

            $table->enum('role', ['creator', 'assigned', 'viewer'])->default('viewer');

            $table->timestamps();

            // Composite PK: one row per (ticket, user) pair
            $table->primary(['ticket_id', 'user_id']);
            $table->index('ticket_id');
            $table->index('user_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ticket_participants');
    }
};
