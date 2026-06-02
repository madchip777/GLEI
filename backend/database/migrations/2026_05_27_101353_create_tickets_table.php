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
     */
    public function up(): void
    {
        Schema::create('tickets', function (Blueprint $table) {
            $table->id();

            // Creator
            $table->foreignId('user_id')
                ->constrained('users')
                ->onDelete('restrict');

            // Admin/support staff assigned to the ticket (nullable)
            $table->foreignId('assigned_to')
                ->nullable()
                ->constrained('users')
                ->onDelete('set null');

            $table->string('title');
            $table->text('description');

            // Raw category string (e.g. 'general', 'it', 'security')
            $table->string('category', 100)->default('general');

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

            $table->timestamps();

            // Indexes for common queries
            $table->index('user_id');
            $table->index('assigned_to');
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
