<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Tickets Table Migration
     *
     * Central table of the support system.
     * A ticket tracks an IT issue, security incident, access request, etc.
     * from creation (draft) through to resolution (closed).
     *
     * Lifecycle: draft -> open -> in_progress -> pending_info -> resolved -> closed
     *
     * Assignment is handled by the ticket_admins pivot table (one ticket
     * can have multiple assigned admins).  The legacy single-column
     * "assigned_to" has been removed in favour of that pivot.
     */
    public function up(): void
    {
        Schema::create('tickets', function (Blueprint $table) {
            $table->id('ticket_id');

            // Creator
            $table->foreignId('user_id')
                ->constrained('users')
                ->onDelete('restrict');

            // Normalised category (nullable to allow a grace period for old data)
            $table->foreignId('category_id')
                ->nullable()
                ->constrained('categories')
                ->onDelete('set null');

            // Keeps the raw category string from before normalisation
            $table->string('category_legacy', 100)->nullable();

            $table->string('title');
            $table->text('description');
            $table->string('subject', 255)->nullable();

            $table->enum('status', [
                'draft',
                'open',
                'in_progress',
                'pending_info',
                'resolved',
                'closed',
            ])->default('draft');

            $table->enum('priority', [
                'low',
                'medium',
                'high',
                'critical',
            ])->default('medium');

            // Admin who closed the ticket
            $table->foreignId('closed_by')
                ->nullable()
                ->constrained('users')
                ->onDelete('set null');

            $table->timestamps();
            $table->timestamp('closed_at')->nullable();

            // Indexes for common queries
            $table->index('user_id');
            $table->index('category_id');
            $table->index('status');
            $table->index('priority');
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tickets');
    }
};
