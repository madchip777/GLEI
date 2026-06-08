<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Pivot table: software assigned to users.
     * One software license can be assigned to multiple users.
     */
    public function up(): void
    {
        Schema::create('user_software', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')
                ->constrained('users')
                ->cascadeOnDelete();
            $table->foreignId('software_id')
                ->constrained('software')
                ->cascadeOnDelete();
            $table->timestamp('assigned_at')->useCurrent();
            $table->unique(['user_id', 'software_id']);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_software');
    }
};
