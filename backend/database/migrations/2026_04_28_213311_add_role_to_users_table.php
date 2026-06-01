<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Add role, material and post_num columns to users table.
     *
     * role    : defines user permissions (user | admin | super_admin)
     * material: IT equipment assigned to the user (e.g. laptop model)
     * post_num: office/desk number to help locate the user on-site
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->enum('role', ['user', 'admin', 'super_admin'])->default('user')->after('email');
            $table->string('material', 100)->nullable()->after('role');
            $table->string('post_num', 50)->nullable()->after('material');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['role', 'material', 'post_num']);
        });
    }
};
