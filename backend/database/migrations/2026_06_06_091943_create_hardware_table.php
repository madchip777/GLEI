<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Hardware items tracked by the company.
     * Can be assigned to a user or sit in the pool.
     */
    public function up(): void
    {
        Schema::create('hardware', function (Blueprint $table) {
            $table->id();
            $table->enum('category', [
                'computer',
                'laptop',
                'monitor',
                'peripheral',
                'mobile_device',
                'printer',
            ]);
            $table->string('brand');
            $table->string('model');
            $table->string('serial_number')->unique();
            $table->date('purchase_date')->nullable();
            $table->enum('condition', [
                'new',
                'good',
                'fair',
                'poor',
            ])->default('good');
            $table->enum('status', [
                'active',
                'in_repair',
                'in_pool',
                'retired',
            ])->default('in_pool');
            $table->foreignId('assigned_to')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();
            $table->timestamp('assigned_at')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('hardware');
    }
};
