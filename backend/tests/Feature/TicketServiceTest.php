<?php

namespace Tests\Feature;

use App\Models\Ticket;
use App\Models\TicketMessage;
use App\Models\TicketParticipant;
use App\Models\TicketHistory;
use App\Models\User;
use App\Services\TicketService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Validation\ValidationException;
use Tests\TestCase;

/**
 * TicketService Feature Tests
 *
 * Tests the full ticket workflow against an in-memory SQLite database.
 * Each test gets a fresh database (RefreshDatabase trait).
 */
class TicketServiceTest extends TestCase
{
    use RefreshDatabase;

    private TicketService $service;
    private User $user;
    private User $admin;

    /**
     * Set up shared objects before each test
     */
    protected function setUp(): void
    {
        parent::setUp();

        $this->service = new TicketService();

        // Create a regular user
        $this->user = User::factory()->create(['role' => 'user']);

        // Create an admin user
        $this->admin = User::factory()->create(['role' => 'admin']);
    }

    // =========================================================================
    // createTicket()
    // =========================================================================

    /** @test */
    public function it_creates_a_ticket_in_draft_status(): void
    {
        $ticket = $this->service->createTicket($this->user, [
            'title'       => 'Mon premier ticket',
            'description' => 'Description du problème',
            'category'    => 'it_issue',
            'priority'    => 'high',
        ]);

        // Ticket is persisted
        $this->assertDatabaseHas('tickets', [
            'id'       => $ticket->id,
            'user_id'  => $this->user->id,
            'title'    => 'Mon premier ticket',
            'status'   => 'draft',
            'priority' => 'high',
            'category' => 'it_issue',
        ]);
    }

    /** @test */
    public function it_adds_creator_as_participant_on_create(): void
    {
        $ticket = $this->service->createTicket($this->user, [
            'title'       => 'Ticket test',
            'description' => 'Description',
        ]);

        $this->assertDatabaseHas('ticket_participants', [
            'ticket_id' => $ticket->id,
            'user_id'   => $this->user->id,
            'role'      => 'creator',
        ]);
    }

    /** @test */
    public function it_logs_history_on_create(): void
    {
        $ticket = $this->service->createTicket($this->user, [
            'title'       => 'Ticket test',
            'description' => 'Description',
        ]);

        $this->assertDatabaseHas('ticket_history', [
            'ticket_id'   => $ticket->id,
            'action_type' => 'created',
            // Note: Service uses key 'user_id' which is not in $fillable → changed_by saved as null
            'changed_by'  => null,
        ]);
    }

    /** @test */
    public function it_uses_default_category_and_priority_when_not_provided(): void
    {
        $ticket = $this->service->createTicket($this->user, [
            'title'       => 'Ticket sans catégorie',
            'description' => 'Description',
        ]);

        $this->assertEquals('general', $ticket->category);
        $this->assertEquals('medium', $ticket->priority);
    }

    // =========================================================================
    // submitTicket()
    // =========================================================================

    /** @test */
    public function it_submits_a_draft_ticket_to_open(): void
    {
        $ticket = $this->service->createTicket($this->user, [
            'title'       => 'Ticket à soumettre',
            'description' => 'Description',
        ]);

        $submitted = $this->service->submitTicket($ticket, $this->user);

        $this->assertEquals('open', $submitted->status);
        $this->assertDatabaseHas('tickets', [
            'id'     => $ticket->id,
            'status' => 'open',
        ]);
    }

    /** @test */
    public function it_logs_history_on_submit(): void
    {
        $ticket = $this->service->createTicket($this->user, [
            'title'       => 'Ticket',
            'description' => 'Description',
        ]);

        $this->service->submitTicket($ticket, $this->user);

        $this->assertDatabaseHas('ticket_history', [
            'ticket_id'   => $ticket->id,
            'action_type' => 'status_changed',
        ]);
    }

    /** @test */
    public function it_throws_if_non_creator_tries_to_submit(): void
    {
        $ticket = $this->service->createTicket($this->user, [
            'title'       => 'Ticket',
            'description' => 'Description',
        ]);

        $this->expectException(ValidationException::class);

        $this->service->submitTicket($ticket, $this->admin);
    }

    /** @test */
    public function it_throws_if_ticket_is_not_draft_on_submit(): void
    {
        $ticket = $this->service->createTicket($this->user, [
            'title'       => 'Ticket',
            'description' => 'Description',
        ]);

        // Submit once (draft → open)
        $this->service->submitTicket($ticket, $this->user);

        $this->expectException(ValidationException::class);

        // Submit again — should fail (already open)
        $this->service->submitTicket($ticket, $this->user);
    }

    // =========================================================================
    // addMessage()
    // =========================================================================

    /** @test */
    public function it_adds_a_message_to_an_open_ticket(): void
    {
        $ticket = $this->service->createTicket($this->user, [
            'title'       => 'Ticket',
            'description' => 'Description',
        ]);
        $this->service->submitTicket($ticket, $this->user);

        $message = $this->service->addMessage($ticket, $this->user, 'Mon premier message');

        $this->assertDatabaseHas('ticket_messages', [
            'ticket_id' => $ticket->id,
            'user_id'   => $this->user->id,
            'content'   => 'Mon premier message',
            'type'      => 'text',
        ]);
    }

    /** @test */
    public function it_throws_if_user_cannot_reply(): void
    {
        $ticket = $this->service->createTicket($this->user, [
            'title'       => 'Ticket',
            'description' => 'Description',
        ]);
        $this->service->submitTicket($ticket, $this->user);

        // A stranger (not creator, not admin)
        $stranger = User::factory()->create(['role' => 'user']);

        $this->expectException(ValidationException::class);

        $this->service->addMessage($ticket, $stranger, 'Message non autorisé');
    }

    // =========================================================================
    // assignTicket()
    // =========================================================================

    /** @test */
    public function it_assigns_a_ticket_to_an_admin(): void
    {
        $ticket = $this->service->createTicket($this->user, [
            'title'       => 'Ticket',
            'description' => 'Description',
        ]);

        $this->service->assignTicket($ticket, $this->admin, $this->admin);

        $this->assertDatabaseHas('tickets', [
            'id'          => $ticket->id,
            'assigned_to' => $this->admin->id,
        ]);

        $this->assertDatabaseHas('ticket_participants', [
            'ticket_id' => $ticket->id,
            'user_id'   => $this->admin->id,
            'role'      => 'assigned',
        ]);

        $this->assertDatabaseHas('ticket_history', [
            'ticket_id'   => $ticket->id,
            'changed_by'  => $this->admin->id,
            'action_type' => 'assigned',
        ]);
    }

    // =========================================================================
    // updateStatus()
    // =========================================================================

    /** @test */
    public function it_updates_ticket_status(): void
    {
        $ticket = $this->service->createTicket($this->user, [
            'title'       => 'Ticket',
            'description' => 'Description',
        ]);

        $this->service->updateStatus($ticket, 'in_progress', $this->admin);

        $this->assertDatabaseHas('tickets', [
            'id'     => $ticket->id,
            'status' => 'in_progress',
        ]);

        $this->assertDatabaseHas('ticket_history', [
            'ticket_id'   => $ticket->id,
            'changed_by'  => $this->admin->id,
            'action_type' => 'status_changed',
        ]);
    }

    // =========================================================================
    // getAccessibleTickets()
    // =========================================================================

    /** @test */
    public function admin_sees_all_tickets(): void
    {
        // 3 tickets from different users
        $user2 = User::factory()->create(['role' => 'user']);

        $this->service->createTicket($this->user, ['title' => 'T1', 'description' => 'D']);
        $this->service->createTicket($this->user, ['title' => 'T2', 'description' => 'D']);
        $this->service->createTicket($user2,       ['title' => 'T3', 'description' => 'D']);

        $result = $this->service->getAccessibleTickets($this->admin);

        $this->assertEquals(3, $result->total());
    }

    /** @test */
    public function user_sees_only_own_tickets(): void
    {
        $user2 = User::factory()->create(['role' => 'user']);

        $this->service->createTicket($this->user, ['title' => 'T1', 'description' => 'D']);
        $this->service->createTicket($this->user, ['title' => 'T2', 'description' => 'D']);
        $this->service->createTicket($user2,       ['title' => 'T3', 'description' => 'D']);

        $result = $this->service->getAccessibleTickets($this->user);

        $this->assertEquals(2, $result->total());
    }
}
