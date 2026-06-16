<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
    * Update ticket_images table to support one-to-many relationship
    * Works with both SQLite and MySQL
    */
    public function up(): void
    {
        $driver = DB::connection()->getDriverName();

        if ($driver === 'mysql') {
            try {
                Schema::table('ticket_images', function (Blueprint $table) {
                    $table->dropUnique(['message_id']);
                });
            } catch (\Exception $e) {
                // Index n'existe pas, rien à faire
            }
        }
    }

    public function down(): void
    {
        $driver = DB::connection()->getDriverName();

        Schema::table('ticket_images', function (Blueprint $table) use ($driver) {
            if ($driver === 'mysql') {
                $table->unique('message_id');
            }
        });
    }
};
