<?php

namespace Database\Seeders;

use App\Models\Software;
use App\Models\User;
use Illuminate\Database\Seeder;

class SoftwareSeeder extends Seeder
{
    public function run(): void
    {
        $john = User::where('email', 'user@company.com')->first();
        $jane = User::where('email', 'jane@company.com')->first();
        $bob = User::where('email', 'bob@company.com')->first();

        $softwareItems = [
            [
                'name' => 'Windows 11 Pro',
                'category' => 'os',
                'version' => '23H2',
                'license_key' => 'XXXXX-XXXXX-XXXXX-XXXXX-WIN11',
                'license_expiry' => null,
                'status' => 'active',
                'users' => [$john->id, $bob->id],
            ],
            [
                'name' => 'macOS Sonoma',
                'category' => 'os',
                'version' => '14.0',
                'license_key' => null,
                'license_expiry' => null,
                'status' => 'active',
                'users' => [$jane->id],
            ],
            [
                'name' => 'Microsoft Office 365',
                'category' => 'office_suite',
                'version' => '2024',
                'license_key' => 'XXXXX-XXXXX-XXXXX-XXXXX-M365',
                'license_expiry' => '2025-12-31',
                'status' => 'active',
                'users' => [$john->id, $jane->id, $bob->id],
            ],
            [
                'name' => 'Bitdefender Total Security',
                'category' => 'antivirus',
                'version' => '27.0',
                'license_key' => 'XXXXX-XXXXX-XXXXX-XXXXX-BDS',
                'license_expiry' => '2025-06-30',
                'status' => 'active',
                'users' => [$john->id, $jane->id, $bob->id],
            ],
            [
                'name' => 'Adobe Creative Cloud',
                'category' => 'business',
                'version' => '2024',
                'license_key' => 'XXXXX-XXXXX-XXXXX-XXXXX-ACC',
                'license_expiry' => '2025-09-01',
                'status' => 'active',
                'users' => [$john->id],
            ],
            [
                'name' => 'SAP HR Module',
                'category' => 'business',
                'version' => '4.0',
                'license_key' => 'XXXXX-XXXXX-XXXXX-XXXXX-SAP',
                'license_expiry' => '2026-01-01',
                'status' => 'active',
                'users' => [$jane->id],
            ],
            [
                'name' => 'QuickBooks Pro',
                'category' => 'business',
                'version' => '2024',
                'license_key' => 'XXXXX-XXXXX-XXXXX-XXXXX-QB',
                'license_expiry' => '2024-12-31',
                'status' => 'expired',
                'users' => [],
            ],
        ];

        foreach ($softwareItems as $item) {
            $users = $item['users'];
            unset($item['users']);

            $software = Software::create($item);

            if (!empty($users)) {
                $software->users()->attach($users, ['assigned_at' => now()]);
            }
        }

        $this->command->info('Software seeded: ' . count($softwareItems));
    }
}
