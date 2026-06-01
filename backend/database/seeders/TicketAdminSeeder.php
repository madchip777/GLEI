<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class TicketAdminSeeder extends Seeder
{
    /**
     * Admins assignes aux tickets.
     *   2=Bob  3=Carole
     */
    public function run(): void
    {
        DB::table('ticket_admins')->insert([
            ['ticket_id' => 1, 'admin_id' => 2, 'assigned_at' => now()->subDays(9)],  // T1 Laptop  -> Bob
            ['ticket_id' => 2, 'admin_id' => 2, 'assigned_at' => now()->subDays(2)],  // T2 VPN     -> Bob
            ['ticket_id' => 2, 'admin_id' => 3, 'assigned_at' => now()->subDays(2)],  // T2 VPN     -> Carole aussi (multi-admin)
            ['ticket_id' => 3, 'admin_id' => 3, 'assigned_at' => now()->subDays(13)], // T3 SAP     -> Carole
            ['ticket_id' => 4, 'admin_id' => 2, 'assigned_at' => now()->subDays(7)],  // T4 Virus   -> Bob
            // T5 Chrome (draft) : pas encore assigne
        ]);
    }
}
