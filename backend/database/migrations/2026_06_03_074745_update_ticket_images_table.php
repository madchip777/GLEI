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

        Schema::table('ticket_images', function (Blueprint $table) use ($driver) {
            if ($driver === 'mysql') {
                $table->dropUnique(['message_id']);
            }
        });
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
