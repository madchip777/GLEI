<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * This table has been replaced by the 'assigned_to' column on the tickets table.
     * The single-admin assignment model is used instead of the multi-admin pivot.
     * Kept as a no-op migration to preserve the migration history order.
     */
    public function up(): void
    {
        // No-op: ticket_admins pivot replaced by tickets.assigned_to
    }

    public function down(): void
    {
        Schema::dropIfExists('ticket_admins');
    }
};
