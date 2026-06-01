<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Users_Software Table Migration
     *
     * Many-to-many pivot between users and softwares.
     * Records which software is installed / assigned to which user.
     */
    public function up(): void
    {
        Schema::create('users_software', function (Blueprint $table) {
            $table->foreignId('user_id')
                ->constrained('users')
                ->onDelete('cascade');

            $table->foreignId('software_id')
                ->constrained('softwares', 'software_id')
                ->onDelete('cascade');

            $table->primary(['user_id', 'software_id']);
            $table->index('user_id');
            $table->index('software_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('users_software');
    }
};
