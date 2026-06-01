<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class MessageSeeder extends Seeder
{
    /**
     * Messages dans les tickets.
     * type 'text'   = message ecrit par un utilisateur ou admin
     * type 'system' = message genere automatiquement par l'application
     *
     *   2=Bob  3=Carole  4=John  5=Jane  6=Marc
     */
    public function run(): void
    {
        DB::table('messages')->insert([

            // ---- Ticket 1 : Laptop de John ----
            ['ticket_id' => 1, 'sender_id' => 4, 'type' => 'text',   'content' => 'Bonjour, mon Dell Latitude 5540 ne s\'allume plus depuis ce matin. Aucun voyant ne s\'allume quand j\'appuie sur le bouton.',                          'created_at' => now()->subDays(10)],
            ['ticket_id' => 1, 'sender_id' => 2, 'type' => 'system', 'content' => 'Statut mis a jour : ouvert -> en cours. Ticket assigne a Bob Dupont.',                                                                                   'created_at' => now()->subDays(9)],
            ['ticket_id' => 1, 'sender_id' => 2, 'type' => 'text',   'content' => 'Bonjour John, pouvez-vous verifier que le cable d\'alimentation est bien branche et essayer une autre prise ?',                                          'created_at' => now()->subDays(9)],
            ['ticket_id' => 1, 'sender_id' => 4, 'type' => 'text',   'content' => 'J\'ai essaye avec une autre prise, le probleme persiste. J\'ai joint une photo du cable.',                                                               'created_at' => now()->subDays(8)],
            ['ticket_id' => 1, 'sender_id' => 2, 'type' => 'text',   'content' => 'Je vais passer a votre bureau cet apres-midi pour diagnostic. Merci de vous assurer d\'etre disponible.',                                                'created_at' => now()->subDays(8)],

            // ---- Ticket 2 : VPN de Jane ----
            ['ticket_id' => 2, 'sender_id' => 5, 'type' => 'text',   'content' => 'Impossible de me connecter au VPN depuis hier. Le client GlobalProtect affiche : "Cannot connect to the gateway".',                                      'created_at' => now()->subDays(3)],
            ['ticket_id' => 2, 'sender_id' => 2, 'type' => 'system', 'content' => 'Statut mis a jour : ouvert. Ticket assigne a Bob Dupont et Carole Lemaire.',                                                                             'created_at' => now()->subDays(2)],
            ['ticket_id' => 2, 'sender_id' => 3, 'type' => 'text',   'content' => 'Bonjour Jane, avez-vous essaye de reinstaller le client GlobalProtect ? Si oui, pouvez-vous nous envoyer une capture d\'ecran du message d\'erreur ?',   'created_at' => now()->subDays(2)],

            // ---- Ticket 3 : SAP de Marc ----
            ['ticket_id' => 3, 'sender_id' => 6, 'type' => 'text',   'content' => 'Bonjour, j\'ai besoin d\'un acces en lecture sur le module Finance de SAP. Demande validee par mon responsable.',                                        'created_at' => now()->subDays(14)],
            ['ticket_id' => 3, 'sender_id' => 3, 'type' => 'system', 'content' => 'Statut mis a jour : ouvert -> en cours. Ticket assigne a Carole Lemaire.',                                                                               'created_at' => now()->subDays(13)],
            ['ticket_id' => 3, 'sender_id' => 3, 'type' => 'text',   'content' => 'Bonjour Marc, votre acces SAP Finance a ete cree. Vos identifiants vous ont ete envoyes par email. Bonne prise en main.',                                'created_at' => now()->subDays(12)],
            ['ticket_id' => 3, 'sender_id' => 3, 'type' => 'system', 'content' => 'Statut mis a jour : en cours -> resolu.',                                                                                                                'created_at' => now()->subDays(12)],
            ['ticket_id' => 3, 'sender_id' => 6, 'type' => 'text',   'content' => 'Acces bien recu, merci Carole !',                                                                                                                        'created_at' => now()->subDays(11)],

            // ---- Ticket 4 : Virus sur le poste de John ----
            ['ticket_id' => 4, 'sender_id' => 4, 'type' => 'text',   'content' => 'Kaspersky a detecte trojan.win32.agent.exe dans mon dossier Telechargements. Fichier mis en quarantaine. Mon poste est-il compromis ?',                  'created_at' => now()->subDays(7)],
            ['ticket_id' => 4, 'sender_id' => 2, 'type' => 'system', 'content' => 'Statut mis a jour : ouvert -> en cours. Ticket assigne a Bob Dupont. Priorite : critique.',                                                              'created_at' => now()->subDays(7)],
            ['ticket_id' => 4, 'sender_id' => 2, 'type' => 'text',   'content' => 'John, merci de ne plus utiliser votre poste. Nous allons l\'isoler du reseau immediatement. Nous vous attribuons un poste de remplacement.',             'created_at' => now()->subDays(6)],
            ['ticket_id' => 4, 'sender_id' => 4, 'type' => 'text',   'content' => 'Compris, je n\'utilise plus le poste. J\'attends votre passage.',                                                                                        'created_at' => now()->subDays(6)],
            ['ticket_id' => 4, 'sender_id' => 2, 'type' => 'text',   'content' => 'Analyse complete. Le trojan a ete supprime, aucune exfiltration detectee. Votre poste original a ete reinitialise et est de nouveau disponible.',        'created_at' => now()->subDays(5)],
            ['ticket_id' => 4, 'sender_id' => 2, 'type' => 'system', 'content' => 'Statut mis a jour : en cours -> clos. Ticket ferme par Bob Dupont.',                                                                                     'created_at' => now()->subDays(5)],

            // ---- Ticket 5 : Chrome de Jane (draft - pas encore soumis, pas de messages) ----
        ]);
    }
}
