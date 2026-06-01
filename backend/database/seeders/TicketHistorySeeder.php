<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class TicketHistorySeeder extends Seeder
{
    /**
     * Audit trail des changements par ticket.
     *   1=Alice  2=Bob  3=Carole  4=John  5=Jane  6=Marc
     */
    public function run(): void
    {
        DB::table('ticket_history')->insert([

            // Ticket 1 - Laptop de John
            ['ticket_id' => 1, 'changed_by' => 4, 'action_type' => 'created',        'old_values' => null,                                  'new_values' => json_encode(['status' => 'draft']),        'created_at' => now()->subDays(10)],
            ['ticket_id' => 1, 'changed_by' => 2, 'action_type' => 'status_changed', 'old_values' => json_encode(['status' => 'draft']),      'new_values' => json_encode(['status' => 'open']),         'created_at' => now()->subDays(9)],
            ['ticket_id' => 1, 'changed_by' => 2, 'action_type' => 'assigned',       'old_values' => json_encode(['assigned_to' => null]),    'new_values' => json_encode(['assigned_to' => 2]),         'created_at' => now()->subDays(9)],
            ['ticket_id' => 1, 'changed_by' => 2, 'action_type' => 'status_changed', 'old_values' => json_encode(['status' => 'open']),       'new_values' => json_encode(['status' => 'in_progress']),  'created_at' => now()->subDays(8)],

            // Ticket 2 - VPN de Jane
            ['ticket_id' => 2, 'changed_by' => 5, 'action_type' => 'created',        'old_values' => null,                                  'new_values' => json_encode(['status' => 'draft']),        'created_at' => now()->subDays(3)],
            ['ticket_id' => 2, 'changed_by' => 5, 'action_type' => 'status_changed', 'old_values' => json_encode(['status' => 'draft']),      'new_values' => json_encode(['status' => 'open']),         'created_at' => now()->subDays(3)],
            ['ticket_id' => 2, 'changed_by' => 2, 'action_type' => 'assigned',       'old_values' => json_encode(['assigned_to' => null]),    'new_values' => json_encode(['assigned_to' => [2, 3]]),    'created_at' => now()->subDays(2)],

            // Ticket 3 - SAP de Marc
            ['ticket_id' => 3, 'changed_by' => 6, 'action_type' => 'created',        'old_values' => null,                                  'new_values' => json_encode(['status' => 'draft']),        'created_at' => now()->subDays(14)],
            ['ticket_id' => 3, 'changed_by' => 6, 'action_type' => 'status_changed', 'old_values' => json_encode(['status' => 'draft']),      'new_values' => json_encode(['status' => 'open']),         'created_at' => now()->subDays(14)],
            ['ticket_id' => 3, 'changed_by' => 3, 'action_type' => 'assigned',       'old_values' => json_encode(['assigned_to' => null]),    'new_values' => json_encode(['assigned_to' => 3]),         'created_at' => now()->subDays(13)],
            ['ticket_id' => 3, 'changed_by' => 3, 'action_type' => 'status_changed', 'old_values' => json_encode(['status' => 'open']),       'new_values' => json_encode(['status' => 'in_progress']),  'created_at' => now()->subDays(13)],
            ['ticket_id' => 3, 'changed_by' => 3, 'action_type' => 'status_changed', 'old_values' => json_encode(['status' => 'in_progress']),'new_values' => json_encode(['status' => 'resolved']),     'created_at' => now()->subDays(12)],

            // Ticket 4 - Virus sur le poste de John (critique)
            ['ticket_id' => 4, 'changed_by' => 4, 'action_type' => 'created',           'old_values' => null,                                       'new_values' => json_encode(['status' => 'draft', 'priority' => 'critical']),  'created_at' => now()->subDays(7)],
            ['ticket_id' => 4, 'changed_by' => 4, 'action_type' => 'status_changed',    'old_values' => json_encode(['status' => 'draft']),           'new_values' => json_encode(['status' => 'open']),                            'created_at' => now()->subDays(7)],
            ['ticket_id' => 4, 'changed_by' => 2, 'action_type' => 'assigned',          'old_values' => json_encode(['assigned_to' => null]),         'new_values' => json_encode(['assigned_to' => 2]),                            'created_at' => now()->subDays(7)],
            ['ticket_id' => 4, 'changed_by' => 2, 'action_type' => 'status_changed',    'old_values' => json_encode(['status' => 'open']),            'new_values' => json_encode(['status' => 'in_progress']),                     'created_at' => now()->subDays(6)],
            ['ticket_id' => 4, 'changed_by' => 2, 'action_type' => 'status_changed',    'old_values' => json_encode(['status' => 'in_progress']),     'new_values' => json_encode(['status' => 'closed']),                          'created_at' => now()->subDays(5)],

            // Ticket 5 - Chrome de Jane (draft, pas encore soumis)
            ['ticket_id' => 5, 'changed_by' => 5, 'action_type' => 'created',        'old_values' => null,                                  'new_values' => json_encode(['status' => 'draft']),        'created_at' => now()->subHours(6)],
        ]);
    }
}
