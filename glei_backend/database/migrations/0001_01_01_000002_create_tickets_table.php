<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('tickets', function (Blueprint $table) {
            $table->id();
            $table->foreignId("user_id")->constrained()->onDelete("cascade");
            $table->foreignId("category_id")->constrained()->onDelete("cascade");
            $table->string('categorie_legacy')->nullable();
            $table->string('title');
            $table->string('subject');
            $table->enum('status', ['ouvert', 'fermé'])->default('ouvert');
            $table->foreignId('closed_by')->nullable()->constrained('users');
            $table->timestamp('closed_at')->nullable();
            $table->timestamp('updated_at')->nullable();
            $table->timestamp('created_at');
        });

        Schema::create('tickets_history', function (Blueprint $table) {
            $table->id();
            $table->foreignId("ticket_id")->constrained()->onDelete("cascade");
            $table->foreignId("user_id")->constrained()->onDelete("cascade");
            $table->string("category_name");
            $table->foreign("category_name")->references("name")->on("categories");
        });

        Schema::create('tickets_admins', function (Blueprint $table) {
            $table->foreignId("ticket_id")->constrained()->onDelete("cascade");
            $table->foreignId("user_id")->constrained()->onDelete("cascade");
            $table->timestamp('created_at');
        });

        Schema::create('categories', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->foreignId('created_by')->constrained('users');
            $table->timestamp('created_at');
        });


    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tickets');
        Schema::dropIfExists('tickets_history');
        Schema::dropIfExists('tickets_admins');
        Schema::dropIfExists('categories');
        
    }
};
