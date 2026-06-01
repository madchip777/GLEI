<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Categories Table Migration
     *
     * Stores ticket categories managed by super_admins.
     * Normalises the category field that was previously a plain string on tickets.
     * Must run before the tickets migration due to the FK constraint.
     */
    public function up(): void
    {
        Schema::create('categories', function (Blueprint $table) {
            $table->id('category_id');

            $table->string('name', 100)->unique();

            // User who created the category (super_admin only)
            $table->foreignId('created_by')
                ->constrained('users')
                ->onDelete('restrict');

            $table->timestamp('created_at')->useCurrent();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('categories');
    }
};
