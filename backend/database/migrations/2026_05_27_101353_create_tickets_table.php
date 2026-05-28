<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Tickets Table Migration
     *
     * Stores main ticket records with status tracking.
     * Supports multiple ticket types (It issues, cybersecurity incidents, etc).
     */
    public function up(): void
    {
        Schema::create('tickets', function (Blueprint $table) {
            $table->id();

            // Foreign key to users table (ticket creator)
            $table->foreignId('assigned_to')->nullable()->constrained('users')->onDelete('set null');

            // Ticket metadata
            $table->string('title'); // Short issue description
            $table->text('description'); // Full problem description
            $table->string('category'); // IT Issue, Security Incident, Access Request, etc.

            // Status tracking (draft, open, in_progress, pending_info, resolved, closed)
            $table->enum('status', [
                'draft',        // Not yet submitted
                'open',         // Submitted, waiting for response
                'in_progress',  // Admin working on it
                'pending_info', // Waiting for more info from the user
                'resolved',     // Issue fixed, pending user confirmation
                'closed',       // Confirmed fixed or user confirmed resolution
            ])->default('draft');

            // Priority level
            $table->enum('priority', ['low', 'medium', 'high', 'critical'])->default('medium');

            $table->timestamps();

            // Indexes for common queries
            $table->index('user_id'); // Find tickets by creator
            $table->index('assigned_to'); // Find tickets assigned to user
            $table->index('status'); // Find tickets by status
            $table->index('created_at'); // Order by creation date
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
