<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class AttachmentSeeder extends Seeder
{
    /**
     * Pieces jointes liees a des messages specifiques.
     *
     * Message IDs (dans l'ordre du MessageSeeder) :
     *   4  = Message de John "J'ai joint une photo du cable" (T1)
     *   14 = Message de John "Kaspersky a detecte..." (T4)
     */
    public function run(): void
    {
        DB::table('attachments')->insert([
            [
                // Photo du cable d'alimentation - Ticket 1, message 4
                'message_id'    => 4,
                'file_name'     => 'cable_alimentation_dell.jpg',
                'url'           => '/storage/attachments/cable_alimentation_dell.jpg',
                'mime_type'     => 'image/jpeg',
                'size_bytes'    => 245760, // ~240 Ko
                'original_path' => 'attachments/originals/cable_alimentation_dell.jpg',
                'width'         => 1280,
                'height'        => 960,
                'created_at'    => now()->subDays(8),
            ],
            [
                // Capture d'ecran alerte Kaspersky - Ticket 4, message 14
                'message_id'    => 14,
                'file_name'     => 'alerte_kaspersky_trojan.png',
                'url'           => '/storage/attachments/alerte_kaspersky_trojan.png',
                'mime_type'     => 'image/png',
                'size_bytes'    => 89088, // ~87 Ko
                'original_path' => 'attachments/originals/alerte_kaspersky_trojan.png',
                'width'         => 800,
                'height'        => 600,
                'created_at'    => now()->subDays(7),
            ],
        ]);
    }
}
