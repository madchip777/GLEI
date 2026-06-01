<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class TicketSeeder extends Seeder
{
    /**
     * 5 tickets couvrant tous les statuts du cycle de vie.
     *
     * Utilisateurs existants :
     *   1=Alice (super_admin)  2=Bob (admin)  3=Carole (admin)
     *   4=John (user)          5=Jane (user)  6=Marc (user)
     *
     * Categories :
     *   1=Probleme materiel  2=Incident securite  3=Demande acces
     *   4=Logiciel           5=Reseau             6=Autre
     */
    public function run(): void
    {
        DB::table('tickets')->insert([
            [
                'user_id'         => 4,        // John
                'category_id'     => 1,        // Probleme materiel
                'category_legacy' => null,
                'title'           => 'PC de John qui ne demarre plus',
                'description'     => 'Le Dell Latitude 5540 de John (Bureau 101) ne s\'allume plus depuis ce matin. Aucun voyant ne s\'allume.',
                'status'          => 'in_progress',
                'priority'        => 'high',
                'closed_by'       => null,
                'created_at'      => now()->subDays(10),
                'updated_at'      => now()->subDays(8),
                'closed_at'       => null,
            ],
            [
                'user_id'         => 5,        // Jane
                'category_id'     => 5,        // Reseau
                'category_legacy' => null,
                'title'           => 'Jane ne peut plus se connecter au VPN',
                'description'     => 'Le MacBook Pro de Jane (Bureau 202) ne parvient plus a etablir la connexion VPN. Erreur : Cannot connect to the gateway.',
                'status'          => 'open',
                'priority'        => 'medium',
                'closed_by'       => null,
                'created_at'      => now()->subDays(3),
                'updated_at'      => now()->subDays(3),
                'closed_at'       => null,
            ],
            [
                'user_id'         => 6,        // Marc
                'category_id'     => 3,        // Demande acces
                'category_legacy' => null,
                'title'           => 'Demande acces SAP Finance pour Marc',
                'description'     => 'Marc (Bureau 305) a besoin d\'un acces en lecture sur le module Finance de SAP ERP suite a sa prise de poste.',
                'status'          => 'resolved',
                'priority'        => 'low',
                'closed_by'       => null,
                'created_at'      => now()->subDays(14),
                'updated_at'      => now()->subDays(12),
                'closed_at'       => null,
            ],
            [
                'user_id'         => 4,        // John
                'category_id'     => 2,        // Incident securite
                'category_legacy' => null,
                'title'           => 'Alerte virus sur le poste de John',
                'description'     => 'Kaspersky a detecte trojan.win32.agent.exe sur le Dell Latitude de John (Bureau 101). Fichier mis en quarantaine.',
                'status'          => 'closed',
                'priority'        => 'critical',
                'closed_by'       => 2,        // Ferme par Bob
                'created_at'      => now()->subDays(7),
                'updated_at'      => now()->subDays(5),
                'closed_at'       => now()->subDays(5),
            ],
            [
                'user_id'         => 5,        // Jane
                'category_id'     => 4,        // Logiciel
                'category_legacy' => null,
                'title'           => 'Chrome plante au demarrage sur le Mac de Jane',
                'description'     => 'Depuis la mise a jour de ce matin, Chrome se ferme immediatement sur le MacBook Pro de Jane (Bureau 202).',
                'status'          => 'draft',
                'priority'        => 'medium',
                'closed_by'       => null,
                'created_at'      => now()->subHours(6),
                'updated_at'      => now()->subHours(6),
                'closed_at'       => null,
            ],
        ]);
    }
}
