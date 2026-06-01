<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Ordre d'execution respectant les contraintes de cles etrangeres.
     *
     * 1. Users          (aucune dependance)
     * 2. Softwares      (aucune dependance)
     * 3. UserSoftware   (depend de users + softwares)
     * 4. Categories     (depend de users - created_by)
     * 5. Tickets        (depend de users + categories)
     * 6. TicketAdmins   (depend de tickets + users)
     * 7. TicketPart.    (depend de tickets + users)
     * 8. TicketHistory  (depend de tickets + users)
     * 9. Messages       (depend de tickets + users)
     * 10. Attachments   (depend de messages)
     */
    public function run(): void
    {
        $this->call([
            UserSeeder::class,
            SoftwareSeeder::class,
            UserSoftwareSeeder::class,
            CategorySeeder::class,
            TicketSeeder::class,
            TicketAdminSeeder::class,
            TicketParticipantSeeder::class,
            TicketHistorySeeder::class,
            MessageSeeder::class,
            AttachmentSeeder::class,
        ]);
    }
}
