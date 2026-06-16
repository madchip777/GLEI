<?php

namespace Database\Seeders;

use App\Models\Hardware;
use App\Models\User;
use Illuminate\Database\Seeder;

class HardwareSeeder extends Seeder
{
    public function run(): void
    {
        $john = User::where('email', 'user@company.com')->first();
        $jane = User::where('email', 'jane@company.com')->first();
        $bob = User::where('email', 'bob@company.com')->first();

        $hardware = [
            // Assigned to John
            [
                'category' => 'laptop',
                'brand' => 'Dell',
                'model' => 'XPS 15',
                'serial_number' => 'SN-DELL-001',
                'purchase_date' => '2023-01-15',
                'condition' => 'good',
                'status' => 'active',
                'assigned_to' => $john->id,
                'assigned_at' => now(),
                'notes' => 'Primary workstation',
            ],
            [
                'category' => 'monitor',
                'brand' => 'LG',
                'model' => '27UK850',
                'serial_number' => 'SN-LG-001',
                'purchase_date' => '2023-01-15',
                'condition' => 'good',
                'status' => 'active',
                'assigned_to' => $john->id,
                'assigned_at' => now(),
            ],
            // Assigned to Jane
            [
                'category' => 'laptop',
                'brand' => 'Apple',
                'model' => 'MacBook Pro 14',
                'serial_number' => 'SN-APPLE-001',
                'purchase_date' => '2023-06-01',
                'condition' => 'new',
                'status' => 'active',
                'assigned_to' => $jane->id,
                'assigned_at' => now(),
            ],
            [
                'category' => 'peripheral',
                'brand' => 'Logitech',
                'model' => 'MX Keys',
                'serial_number' => 'SN-LOGI-001',
                'purchase_date' => '2023-06-01',
                'condition' => 'good',
                'status' => 'active',
                'assigned_to' => $jane->id,
                'assigned_at' => now(),
            ],
            // Assigned to Bob
            [
                'category' => 'computer',
                'brand' => 'HP',
                'model' => 'EliteDesk 800',
                'serial_number' => 'SN-HP-001',
                'purchase_date' => '2022-03-10',
                'condition' => 'fair',
                'status' => 'active',
                'assigned_to' => $bob->id,
                'assigned_at' => now(),
                'notes' => 'Due for replacement',
            ],
            // In pool
            [
                'category' => 'laptop',
                'brand' => 'Lenovo',
                'model' => 'ThinkPad X1',
                'serial_number' => 'SN-LENOVO-001',
                'purchase_date' => '2024-01-01',
                'condition' => 'new',
                'status' => 'in_pool',
            ],
            [
                'category' => 'monitor',
                'brand' => 'Samsung',
                'model' => '32" Curved',
                'serial_number' => 'SN-SAMSUNG-001',
                'purchase_date' => '2023-09-15',
                'condition' => 'good',
                'status' => 'in_pool',
            ],
            [
                'category' => 'mobile_device',
                'brand' => 'Apple',
                'model' => 'iPhone 15',
                'serial_number' => 'SN-IPHONE-001',
                'purchase_date' => '2024-02-01',
                'condition' => 'new',
                'status' => 'in_pool',
            ],
            // In repair
            [
                'category' => 'printer',
                'brand' => 'Brother',
                'model' => 'HL-L3270CDW',
                'serial_number' => 'SN-BROTHER-001',
                'purchase_date' => '2021-05-20',
                'condition' => 'poor',
                'status' => 'in_repair',
                'notes' => 'Paper jam issue',
            ],
            // Retired
            [
                'category' => 'computer',
                'brand' => 'Dell',
                'model' => 'OptiPlex 3060',
                'serial_number' => 'SN-DELL-OLD-001',
                'purchase_date' => '2018-01-01',
                'condition' => 'poor',
                'status' => 'retired',
                'notes' => 'End of life',
            ],
        ];

        foreach ($hardware as $item) {
            Hardware::create($item);
        }

        $this->command->info('Hardware seeded: ' . count($hardware));
    }
}
