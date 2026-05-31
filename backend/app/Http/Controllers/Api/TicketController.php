<?php

namespace App\Http\Controllers\Api;

use App\Models\Ticket;
use App\Models\TicketMessage;
use App\Services\TicketService;
use Exception;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\ValidationException;

/**
 * Ticket Controller
 *
 * Handles HTTP requests for ticket operation.
 * All methods require  authentication (auth:sanctum).
 *
 * Endpoints:
 * - POST /api/tickets - Create ticket
 * - GET /api/tickets - List user's tickets
 * - GET /api/tickets/{id} - Get ticket details
 * - POST /api/tickets/{id}/submit - Submit draft ticket
 * - POST /api/tickets/{id}/messages - Add message to ticket
 * - POST /api/tickets/{id}/messages/{msgId}/image - Upload image to message
 */
class TicketController
{
    /**
     * Ticket service instance
     *
     * @var TicketService
     */
    private TicketService $ticketService;

    /**
     * Constructor - Inject ticket service
     *
     * @param TicketService $ticketService
     */
    public function __construct(TicketService $ticketService)
    {
        $this->ticketService = $ticketService;
    }

    /**
     * Create Ticket Endpoint
     *
     * Creates a new ticket in 'draft' status.
     * Only  authenticated users can create tickets.
     *
     * @route POST /api/tickets
     * @access Protected (requires auth:sanctum)
     *
     * @param Request $request HTTP request with ticket data
     *
     * @return JsonResponse
     * - 201: Ticket created successfully
     * - 422: Validation error
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string|max:2000',
            'category' => 'nullable|string|in:it_issue,security_incident,access_request,other',
            'priority' => 'nullable|string|in:low,medium,high,critical',
        ]);

        try {
            $ticket = $this->ticketService->createTicket($request->user(), $validated);

            return response()->json([
                'success' => true,
                'message' => 'Ticket created successfully',
                'data' => [
                    'ticket' => [
                        'id' => $ticket->id,
                        'title' => $ticket->title,
                        'status' => $ticket->status,
                        'created_at' => $ticket->created_at,
                    ],
                ],
            ], 201);
        } catch (Exception $exception) {
            return response()->json([
                'success' => false,
                'message' => 'Error creating ticket ' . $exception->getMessage(),
            ], 500);
        }
    }

    /**
     * List User's Tickets
     *
     * Returns paginated list of tickets for authenticated user.
     * Admins see all tickets, users see only their own.
     *
     * @route GET /api/tickets
     * @access Protected (requires auth:sanctum)
     *
     * @param Request $request HTTP request
     *
     * @return JsonResponse
     * - 200: Success with ticket list
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $tickets = $this->ticketService->getAccessibleTickets($request->user(), 20);

            return response()->json([
                'success' => true,
                'data' => [
                    'tickets' => $tickets->items(),
                    'pagination' => [
                        'current_page' => $tickets->currentPage(),
                        'total' => $tickets->total(),
                        'per_page' => $tickets->perPage(),
                    ],
                ],
            ], 200);

        } catch (Exception $exception) {
            return response()->json([
                'success' => false,
                'message' => 'Error fetching tickets',
            ], 500);
        }
    }

    /**
     * Get Ticket Details
     *
     * Returns dull ticket  with messages and history.
     * USer must  have access to the ticket.
     *
     * @route GET /api/tickets/{id}
     * @access Protected (requires auth:sanctum)
     *
     * @param Request $request
     * @param int $id Ticket ID
     *
     * @return JsonResponse
     * - 200: Success with ticket details
     * - 403: User doesn't have access
     * - 404: Ticket not found
     */
    public function show(Request $request, int $id): JsonResponse
    {
        try {
            // Find ticket
            $ticket = Ticket::with([
                'messages' => function ($query) {
                $query->with('user', 'image')->orderBy('created_at', 'asc');
                },
                'history' => function ($query) {
                    $query->orderBy('created_at', 'desc');
                }
            ])->findOrFail($id);

            // Check access
            if (!$ticket->canAccess($request->user())) {
                return response()->json([
                    'success' => false,
                    'message' => 'You do not have access to this ticket',
                ], 403);
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'ticket' => [
                        'id' => $ticket->id,
                        'title' => $ticket->title,
                        'description' => $ticket->description,
                        'status' => $ticket->status,
                        'priority' => $ticket->priority,
                        'category' => $ticket->category,
                        'created_at' => $ticket->created_at,
                        'messages' => $ticket->messages,
                        'history' => $ticket->history,
                    ],
                ],
            ], 200);

        } catch (ModelNotFoundException $exception) {
            return response()->json([
                'success' => false,
                'message' => 'Ticket not found',
            ], 404);

        } catch (Exception $exception) {
            return response()->json([
                'success' => false,
                'message' => 'Error fetching ticket',
            ], 500);
        }
    }

    /**
     * Submit Ticket Endpoint
     *
     * Changes ticket from 'draft' to 'open' status.
     * Only creator can submit their own draft.
     *
     * @route POST /api/tickets/{id}/submit
     * @access Protected (requires auth:sanctum)
     *
     * @param Request $request
     * @param int $id Ticket ID
     *
     * @return JsonResponse
     * - 200:Ticket submitted successfully
     * - 403: User not authorized
     * - 404: Ticket not found
     */
    public function submit(Request $request, int $id): JsonResponse
    {
        try {
            $ticket = Ticket::findOrFail($id);

            // Submit ticket using service
            $ticket = $this->ticketService->submitTicket($ticket, $request->user());

            return response()->json([
                'success' => true,
                'message' => 'Ticket submitted successfully',
                'data' => [
                    'ticket' => $ticket,
                ],
            ], 200);
        } catch (ValidationException $exception) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot submit ticket',
                'errors' => $exception->errors(),
            ], 422);
        } catch (ModelNotFoundException $exception) {
            return response()->json([
                'success' => false,
                'message' => 'Ticket not found',
            ], 404);

        } catch (Exception $exception) {
            return response()->json([
                'success' => false,
                'message' => 'Error submitting ticket',
            ], 500);
        }
    }

    /**
     * Add Message to Ticket
     *
     * Creates a new message in ticket chat.
     * Message is immutable (no edit/delete).
     *
     * @route POST /api/tickets/{id}/messages
     * @access Protected (requires auth:sanctum)
     *
     * @param Request $request HTTP request with message content
     * @param int $id Ticket ID
     *
     * @return JsonResponse
     * - 201: Message created
     * - 403: User can't reply
     * - 404: Ticket not found
     */
    public function addMessage(Request $request, int $id): JsonResponse
    {
        // Validate message content
        $validated = $request->validate([
            'content' => 'required|string|max:2000',
        ]);

        try  {
            $ticket = Ticket::findOrFail($id);

            // Add message using service
            $message = $this->ticketService->addMessage(
                $ticket,
                $request->user(),
                $validated['content']
            );

            return response()->json([
                'success' => true,
                'message' => 'Message added successfully',
                'data' => [
                    'message' => $message,
                ],
            ], 201);

        } catch (ValidationException $exception) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot add message',
                'errors' => $exception->errors(),
            ], 403);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $exception) {
            return response()->json([
                'success' => false,
                'message' => 'Ticket not found',
            ], 404);

        } catch (Exception $exception) {
            return response()->json([
                'success' => false,
                'message' => 'Error adding message',
            ], 500);
        }
    }

    /**
     * Upload Image to Message
     *
     * Attaches image to a ticket message.
     * Generates thumbnail automatically.
     * Max size: 5MMB, allowed: JPEG, PNG, GIF
     *
     * @route POST /api/tickets/{id}/messages/{msgId}/image
     * @access Protected (requires auth:sanctum)
     *
     * @param Request $request HTTP request with file
     * @param int $id Ticket ID
     * @param int $msgId Message ID
     *
     * @return JsonResponse
     * - 201: Image uploaded
     * - 422: Validation error (invalid image)
     * - 404: Ticket or message not found
     */
    public function uploadImage(Request $request, int $id, int $msgId): JsonResponse
    {
        // Validate file
        $validated = $request->validate([
            'image' => 'required|file|mimes:jpeg,png,gif|max:5120', // 5MB in KB
        ]);

        try {
            $ticket = Ticket::FindOrFail($id);
            $message = TicketMessage::where('id', $msgId)
                ->where('ticket_id', $id)
                ->firstOrFail();

            // Upload image using service
            $image = $this->ticketService->uploadImage($message, $request->file('image'));

            return response()->json([
                'success' => true,
                'message' => 'Image uploaded successfully',
                'data' => [
                    'image' => [
                        'id' => $image->id,
                        'original_url' => $image->getOriginalUrl(),
                        'thumbnail_url' => $image->getThumbnailUrl(),
                        'width' => $image->width,
                        'height' => $image->height,
                    ],
                ],
            ], 201);
        } catch (ValidationException $exception) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid image',
                'errors' => $exception->errors(),
            ], 422);
        } catch (ModelNotFoundException $exception) {
            return response()->json([
                'success' => false,
                'message' => 'Ticket or message not found',
            ], 404);
        } catch (Exception $exception) {
            return response()->json([
                'success' => false,
                'message' => 'Error uploading image: ' . $exception->getMessage(),
            ], 500);
        }
    }
}
