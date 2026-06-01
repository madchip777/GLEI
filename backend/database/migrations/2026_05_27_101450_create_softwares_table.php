<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Softwares Table Migration
     *
     * Reference table of software products known to the IT system.
     * Used to link users to the software they have installed or are entitled to.
     */
    public function up(): void
    {
        Schema::create('softwares', function (Blueprint $table) {
            $table->id('software_id');

            $table->string('name', 100)->unique();

            $table->enum('type', [
                'os',
                'browser',
                'erp',
                'antivirus',
                'other',
            ])->default('other');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('softwares');
    }
};
