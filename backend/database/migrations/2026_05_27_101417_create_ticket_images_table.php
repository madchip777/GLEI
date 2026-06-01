<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Attachments Table Migration
     *
     * Stores files attached to ticket messages.
     * Each message can have at most one attachment.
     * Both a public URL and the raw storage path are kept so the file
     * can be served through the API or accessed directly on disk.
     */
    public function up(): void
    {
        Schema::create('attachments', function (Blueprint $table) {
            $table->id('attachment_id');

            $table->foreignId('message_id')
                ->constrained('messages', 'message_id')
                ->onDelete('cascade');

            $table->string('file_name');
            $table->string('url', 500);
            $table->string('mime_type', 100);
            $table->unsignedInteger('size_bytes');
            $table->string('original_path', 500);

            $table->timestamp('created_at')->useCurrent();

            $table->index('message_id');
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('attachments');
    }
};
