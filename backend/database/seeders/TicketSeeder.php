<?php

namespace Database\Seeders;

use App\Models\Ticket;
use App\Models\TicketHistory;
use App\Models\TicketMessage;
use App\Models\TicketParticipant;
use App\Models\User;
use Illuminate\Database\Seeder;

class TicketSeeder extends Seeder
{
    public function run(): void
    {
        $superAdmin = User::where('email', 'superadmin@company.com')->first();
        $admin = User::where('email', 'admin@company.com')->first();
        $john = User::where('email', 'user@company.com')->first();
        $jane = User::where('email', 'jane@company.com')->first();
        $bob = User::where('email', 'bob@company.com')->first();

        $tickets = [
            // Open ticket - unassigned
            [
                'ticket' => [
                    'user_id' => $john->id,
                    'title' => 'Cannot access VPN',
                    'description' => 'Since this morning I cannot connect to the company VPN. I get an authentication error. I have tried restarting my laptop but the issue persists.',
                    'category' => 'it_issue',
                    'priority' => 'high',
                    'status' => 'open',
                ],
                'messages' => [
                    ['user_id' => $john->id, 'content' => 'I also tried reinstalling the VPN client but still the same error.'],
                ],
                'participants' => [
                    ['user_id' => $john->id, 'role' => 'creator'],
                ],
                'history' => [
                    ['changed_by' => $john->id, 'action_type' => 'created', 'old_values' => null, 'new_values' => ['status' => 'open']],
                ],
            ],
            // In progress - assigned to admin
            [
                'ticket' => [
                    'user_id' => $jane->id,
                    'title' => 'Outlook not syncing emails',
                    'description' => 'My Outlook has not been syncing emails for the past 2 days. I can receive emails on my phone but not on my computer.',
                    'category' => 'it_issue',
                    'priority' => 'medium',
                    'status' => 'in_progress',
                    'assigned_to' => $admin->id,
                ],
                'messages' => [
                    ['user_id' => $jane->id, 'content' => 'I have tried restarting Outlook several times.'],
                    ['user_id' => $admin->id, 'content' => 'Hi Jane, I am looking into this. Can you tell me which version of Outlook you are using?'],
                    ['user_id' => $jane->id, 'content' => 'I am using Outlook 365, version 2024.'],
                ],
                'participants' => [
                    ['user_id' => $jane->id, 'role' => 'creator'],
                    ['user_id' => $admin->id, 'role' => 'assigned'],
                ],
                'history' => [
                    ['changed_by' => $jane->id, 'action_type' => 'created', 'old_values' => null, 'new_values' => ['status' => 'open']],
                    ['changed_by' => $admin->id, 'action_type' => 'assigned', 'old_values' => ['assigned_to' => null], 'new_values' => ['assigned_to' => $admin->id]],
                    ['changed_by' => $admin->id, 'action_type' => 'status_changed', 'old_values' => ['status' => 'open'], 'new_values' => ['status' => 'in_progress']],
                ],
            ],
            // Resolved ticket
            [
                'ticket' => [
                    'user_id' => $bob->id,
                    'title' => 'New monitor not detected',
                    'description' => 'The new Samsung monitor assigned to me is not being detected by my computer. I have tried different HDMI cables.',
                    'category' => 'hardware',
                    'priority' => 'medium',
                    'status' => 'resolved',
                    'assigned_to' => $admin->id,
                ],
                'messages' => [
                    ['user_id' => $bob->id, 'content' => 'I have tried both HDMI ports on the monitor.'],
                    ['user_id' => $admin->id, 'content' => 'Bob, please try using a DisplayPort cable instead of HDMI.'],
                    ['user_id' => $bob->id, 'content' => 'That worked! The monitor is now detected. Thank you!'],
                    ['user_id' => $admin->id, 'content' => 'Great! Marking this as resolved. Let me know if the issue comes back.'],
                ],
                'participants' => [
                    ['user_id' => $bob->id, 'role' => 'creator'],
                    ['user_id' => $admin->id, 'role' => 'assigned'],
                ],
                'history' => [
                    ['changed_by' => $bob->id, 'action_type' => 'created', 'old_values' => null, 'new_values' => ['status' => 'open']],
                    ['changed_by' => $admin->id, 'action_type' => 'assigned', 'old_values' => ['assigned_to' => null], 'new_values' => ['assigned_to' => $admin->id]],
                    ['changed_by' => $admin->id, 'action_type' => 'status_changed', 'old_values' => ['status' => 'open'], 'new_values' => ['status' => 'in_progress']],
                    ['changed_by' => $admin->id, 'action_type' => 'status_changed', 'old_values' => ['status' => 'in_progress'], 'new_values' => ['status' => 'resolved']],
                ],
            ],
            // Closed ticket
            [
                'ticket' => [
                    'user_id' => $john->id,
                    'title' => 'Request for Adobe Creative Cloud',
                    'description' => 'I need Adobe Creative Cloud for a new project requiring Photoshop and Illustrator.',
                    'category' => 'software',
                    'priority' => 'low',
                    'status' => 'closed',
                    'assigned_to' => $superAdmin->id,
                ],
                'messages' => [
                    ['user_id' => $john->id, 'content' => 'I need this for the new marketing campaign starting next month.'],
                    ['user_id' => $superAdmin->id, 'content' => 'License approved and assigned. You should have access within the hour.'],
                    ['user_id' => $john->id, 'content' => 'Perfect, I can see it now. Thank you!'],
                ],
                'participants' => [
                    ['user_id' => $john->id, 'role' => 'creator'],
                    ['user_id' => $superAdmin->id, 'role' => 'assigned'],
                ],
                'history' => [
                    ['changed_by' => $john->id, 'action_type' => 'created', 'old_values' => null, 'new_values' => ['status' => 'open']],
                    ['changed_by' => $superAdmin->id, 'action_type' => 'assigned', 'old_values' => ['assigned_to' => null], 'new_values' => ['assigned_to' => $superAdmin->id]],
                    ['changed_by' => $superAdmin->id, 'action_type' => 'status_changed', 'old_values' => ['status' => 'open'], 'new_values' => ['status' => 'in_progress']],
                    ['changed_by' => $superAdmin->id, 'action_type' => 'status_changed', 'old_values' => ['status' => 'in_progress'], 'new_values' => ['status' => 'closed']],
                ],
            ],
            // Critical open ticket
            [
                'ticket' => [
                    'user_id' => $jane->id,
                    'title' => 'Payroll software crash - urgent',
                    'description' => 'QuickBooks crashed during payroll processing and now will not open. Payroll needs to be processed by end of day.',
                    'category' => 'software',
                    'priority' => 'critical',
                    'status' => 'open',
                ],
                'messages' => [
                    ['user_id' => $jane->id, 'content' => 'I have error code QB-2024-ERR-500. This is blocking payroll processing.'],
                ],
                'participants' => [
                    ['user_id' => $jane->id, 'role' => 'creator'],
                ],
                'history' => [
                    ['changed_by' => $jane->id, 'action_type' => 'created', 'old_values' => null, 'new_values' => ['status' => 'open']],
                ],
            ],
            // In progress with viewer participant
            [
                'ticket' => [
                    'user_id' => $bob->id,
                    'title' => 'Printer not working on second floor',
                    'description' => 'The Brother printer on the second floor is showing an offline status. Multiple employees are affected.',
                    'category' => 'hardware',
                    'priority' => 'medium',
                    'status' => 'in_progress',
                    'assigned_to' => $admin->id,
                ],
                'messages' => [
                    ['user_id' => $bob->id, 'content' => 'Three other colleagues have confirmed the same issue.'],
                    ['user_id' => $admin->id, 'content' => 'I have reset the printer spooler service. Can you try printing now?'],
                    ['user_id' => $bob->id, 'content' => 'Still showing offline. The printer has a yellow warning light.'],
                ],
                'participants' => [
                    ['user_id' => $bob->id, 'role' => 'creator'],
                    ['user_id' => $admin->id, 'role' => 'assigned'],
                    ['user_id' => $superAdmin->id, 'role' => 'viewer'],
                ],
                'history' => [
                    ['changed_by' => $bob->id, 'action_type' => 'created', 'old_values' => null, 'new_values' => ['status' => 'open']],
                    ['changed_by' => $admin->id, 'action_type' => 'assigned', 'old_values' => ['assigned_to' => null], 'new_values' => ['assigned_to' => $admin->id]],
                    ['changed_by' => $admin->id, 'action_type' => 'status_changed', 'old_values' => ['status' => 'open'], 'new_values' => ['status' => 'in_progress']],
                    ['changed_by' => $superAdmin->id, 'action_type' => 'participant_joined', 'old_values' => null, 'new_values' => ['user_id' => $superAdmin->id, 'role' => 'viewer']],
                ],
            ],
        ];

        foreach ($tickets as $data) {
            $ticket = Ticket::create($data['ticket']);

            // Add messages
            foreach ($data['messages'] as $msg) {
                TicketMessage::create([
                    'ticket_id' => $ticket->id,
                    'user_id' => $msg['user_id'],
                    'content' => $msg['content'],
                    'type' => 'text',
                    'created_at' => now(),
                ]);
            }

            // Add participants
            foreach ($data['participants'] as $participant) {
                TicketParticipant::create([
                    'ticket_id' => $ticket->id,
                    'user_id' => $participant['user_id'],
                    'role' => $participant['role'],
                ]);
            }

            // Add history
            foreach ($data['history'] as $history) {
                TicketHistory::create([
                    'ticket_id' => $ticket->id,
                    'changed_by' => $history['changed_by'],
                    'action_type' => $history['action_type'],
                    'old_values' => $history['old_values'],
                    'new_values' => $history['new_values'],
                    'created_at' => now(),
                ]);
            }
        }

        $this->command->info('Tickets seeded: ' . count($tickets));
    }
}
