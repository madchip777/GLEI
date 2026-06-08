<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Software licences tracked byy the company.
     */
    public function up(): void
    {
        Schema::create('software', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->enum('category', [
                'os',
                'office_suite',
                'antivirus',
                'business',
            ]);
            $table->string('version')->nullable();
            $table->string('license_key')->nullable();
            $table->date('licence_expiry')->nullable();
            $table->enum('status', [
                'active',
                'expired',
                'retired',
            ])->default('active');
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('software');
    }
};
