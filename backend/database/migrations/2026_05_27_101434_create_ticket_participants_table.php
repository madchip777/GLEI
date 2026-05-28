<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Ticket Participants Table Migration
     *
     * Defines who can access/see each ticket.
     * Implements access control for ticket visibility.
     */
    public function up(): void
    {
        Schema::create('ticket_participants', function (Blueprint $table) {
            $table->id();

            // Foreign keys
            $table->foreignId('ticket_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');

            // Permission level
            $table->enum('role', ['creator', 'assigned', 'viewer'])->default('viewer');
            // 'creator' = original ticket creator (can edit before submission)
            // 'assigned' = assigned admin/support staff (can respond, change status)
            // 'viewer' = can view only (read-only access)

            // Timestamps
            $table->timestamps();

            // Unique constraint - each user once per ticket
            $table->unique(['ticket_id', 'user_id']);

            // Indexes
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
