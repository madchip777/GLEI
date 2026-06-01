<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class TicketParticipantSeeder extends Seeder
{
    /**
     * Droits d'acces par ticket.
     * Couvre les trois roles possibles : creator / assigned / viewer
     *
     *   1=Alice(super_admin)  2=Bob(admin)  3=Carole(admin)
     *   4=John(user)          5=Jane(user)  6=Marc(user)
     *
     * Role 'viewer' : Alice supervise le ticket virus (T4) en lecture seule.
     */
    public function run(): void
    {
        DB::table('ticket_participants')->insert([

            // Ticket 1 - Laptop de John
            ['ticket_id' => 1, 'user_id' => 4, 'role' => 'creator',  'created_at' => now()->subDays(10), 'updated_at' => now()->subDays(10)],
            ['ticket_id' => 1, 'user_id' => 2, 'role' => 'assigned', 'created_at' => now()->subDays(9),  'updated_at' => now()->subDays(9)],

            // Ticket 2 - VPN de Jane
            ['ticket_id' => 2, 'user_id' => 5, 'role' => 'creator',  'created_at' => now()->subDays(3), 'updated_at' => now()->subDays(3)],
            ['ticket_id' => 2, 'user_id' => 2, 'role' => 'assigned', 'created_at' => now()->subDays(2), 'updated_at' => now()->subDays(2)],
            ['ticket_id' => 2, 'user_id' => 3, 'role' => 'assigned', 'created_at' => now()->subDays(2), 'updated_at' => now()->subDays(2)],

            // Ticket 3 - SAP de Marc
            ['ticket_id' => 3, 'user_id' => 6, 'role' => 'creator',  'created_at' => now()->subDays(14), 'updated_at' => now()->subDays(14)],
            ['ticket_id' => 3, 'user_id' => 3, 'role' => 'assigned', 'created_at' => now()->subDays(13), 'updated_at' => now()->subDays(13)],

            // Ticket 4 - Virus sur le poste de John
            ['ticket_id' => 4, 'user_id' => 4, 'role' => 'creator',  'created_at' => now()->subDays(7), 'updated_at' => now()->subDays(7)],
            ['ticket_id' => 4, 'user_id' => 2, 'role' => 'assigned', 'created_at' => now()->subDays(7), 'updated_at' => now()->subDays(7)],
            ['ticket_id' => 4, 'user_id' => 1, 'role' => 'viewer',   'created_at' => now()->subDays(7), 'updated_at' => now()->subDays(7)], // Alice surveille l'incident securite

            // Ticket 5 - Chrome de Jane (draft, createur uniquement)
            ['ticket_id' => 5, 'user_id' => 5, 'role' => 'creator',  'created_at' => now()->subHours(6), 'updated_at' => now()->subHours(6)],
        ]);
    }
}
