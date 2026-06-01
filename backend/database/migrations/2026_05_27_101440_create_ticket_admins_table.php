<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Ticket Admins Table Migration
     *
     * Pivot table linking tickets to the admin(s) assigned to handle them.
     * A ticket can be assigned to multiple admins simultaneously.
     * This replaces the single "assigned_to" column that was on the tickets table.
     */
    public function up(): void
    {
        Schema::create('ticket_admins', function (Blueprint $table) {
            $table->foreignId('ticket_id')
                ->constrained('tickets', 'ticket_id')
                ->onDelete('cascade');

            $table->foreignId('admin_id')
                ->constrained('users')
                ->onDelete('cascade');

            $table->timestamp('assigned_at')->useCurrent();

            $table->primary(['ticket_id', 'admin_id']);
            $table->index('ticket_id');
            $table->index('admin_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ticket_admins');
    }
};
