<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Hardware;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

/**
 * HardwareController
 *
 * Handles hardware inventory management:
 * - List all hardware
 * - Create hardware item
 * - Update hardware item
 * - Assign hardware to user
 * - Unassign hardware from user (return to pool)
 */
class HardwareController extends Controller
{
    /**
     * List of all items
     * Optionally filter by status, category, or assigned user
     *
     * @route GET /pai/hardware
     * @access admin, super_admin
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $query = Hardware::with('assignedUser');

            // Optional filters
            if ($request->has('status')) {
                $query->where('status', $request->status);
            }
            if ($request->has('category')) {
                $query->where('category', $request->category);
            }
            if ($request->has('assigned_to')) {
                $query->where('assigned_to', $request->assigned_to);
            }

            $hardware = $query->orderBy('category')
                ->orderBy('brand')
                ->get();

            return response()->json([
                'success' => true,
                'data' => ['hardware' => $hardware],
            ], 200);
        } catch (\Exception $exception) {
            Log::error('Failed to list hardware', ['error' => $exception->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve hardware',
            ], 500);
        }
    }

    /**
     * Get a single hardware item
     *
     * @route GET /api/hardware/{id}
     * @access admin, super_admin
     */
    public function show(int $id): JsonResponse
    {
        try {
            $hardware = Hardware::with('assignedUser')->findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => [ 'hardware' => $hardware],
            ], 200);
        } catch (ModelNotFoundException $exception) {
            return response()->json([
                'success' => false,
                'message' => 'Hardware not found',
            ], 404);
        } catch (\Exception $exception) {
            Log::error('Failed to retrieve hardware', ['error' => $exception->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve hardware',
            ], 500);
        }
    }

    /**
     * Create a hardware item
     *
     * @route POST /api/hardware
     * @access admin, super_admin
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'category' => 'required|string|in:computer,laptop,monitor,peripheral,mobile_device,printer',
                'brand' => 'required|string|max:255',
                'model' => 'required|string|max:255',
                'serial_number' => 'required|string|unique:hardware,serial_number',
                'purchase_date' => 'nullable|date',
                'condition' => 'required|string|in:new,good,fair,poor',
                'status' => 'required|string|in:active,in_repair,in_pool,retired',
                'notes' => 'nullable|string',
            ]);

            $hardware = Hardware::create($validated);
            Log::info('Hardware created', [
                'hardware' => $hardware->id,
                'created_by' => $request->user()->id,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Hardware created successfully',
                'data' => ['hardware' => $hardware],
            ], 201);

        } catch (ValidationException $exception) {
            return response()->json([
                'success' => false,
                'massage' => 'Validation failed',
                'error' => $exception->getMessage(),
            ], 422);

        } catch (\Exception $exception) {
            Log::error('Failed to create hardware', ['error' => $exception->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to create hardware',
            ], 500);
        }
    }

    /**
     * Update a hardware item
     *
     * @route PUT /api/hardware/{id}
     * @access admin, super_admin
     */
    public function update(Request $request, int $id): JsonResponse
    {
        try {
            $hardware = Hardware::findOrFail($id);


            $validated = $request->validate([
                'category' => 'sometimes|string|in:computer,laptop,monitor,peripheral,mobile_device,printer',
                'brand' => 'sometimes|string|max:255',
                'model' => 'sometimes|string|max:255',
                'serial_number' => 'sometimes|string|unique:hardware,serial_number,' . $id,
                'purchase_date' => 'nullable|date',
                'condition' => 'sometimes|string|in:new,good,fair,poor',
                'status' => 'sometimes|string|in:active,in_repair,in_pool,retired',
                'notes' => 'nullable|string',
            ]);

            $hardware->update($validated);

            Log::info('Hardware updated', [
                'hardware_id' => $hardware->id,
                'updated_by' => $request->user()->id,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Hardware updated successfully',
                'data' => ['hardware' => $hardware->fresh('assignedUser')],
            ], 200);

        } catch (ValidationException $exception) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'error' => $exception->getMessage(),
            ], 422);

        } catch (ModelNotFoundException $exception) {
            return response()->json([
                'success' => false,
                'message' => 'Hardware not found',
            ], 404);

        } catch (\Exception $exception) {
            Log::error('Failed to update hardware', ['error' => $exception->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to update hardware',
            ], 500);
        }
    }

    /**
     * Delete a hardware item
     * Only allowed if not currently assigned
     *
     * @route DELETE /api/hardware/{id}
     * @access admin, super_admin
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        try {
            $hardware = Hardware::findOrFail($id);

            if ($hardware->isAssigned()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot delete hardware that is currently assigned to a user. unassign it first.',
                ], 422);
            }

            $hardware->delete();

            Log::info('Hardware deleted', [
                'hardware_id' => $id,
                'deleted_by' => $request->user()->id,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Hardware deleted successfully',
            ], 200);
        } catch (ModelNotFoundException $exception) {
            return response()->json([
                'success' => false,
                'message' => 'Hardware not found',
            ], 404);
        } catch (\Exception $exception) {
            Log::error('Failed to delete hardware', ['error' => $exception->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete hardware',
            ], 500);
        }
    }

    /**
     * Assign hardware to a user
     *
     * @route POST /api/hardware/{id}/assign
     * @access admin, super_admin
     */
    public function assign(Request $request, int $id): JsonResponse
    {
        try {
            $hardware = Hardware::findOrFail($id);

            $validated = $request->validate([
                'user_id' => 'required|exists:users,id',
            ]);

            if ($hardware->isAssigned()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Hardware is already assigned to a user. Unassign it first.',
                ], 422);
            }

            if ($hardware->status == 'retired') {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot assign retired hardware.',
                ], 422);
            }

            $hardware->update([
                'assigned_to' => $validated['user_id'],
                'assigned_at' => now(),
                'status' => 'active',
            ]);

            Log::info('Hardware assigned', [
                'hardware_id' => $hardware->id,
                'user_id' => $validated['user_id'],
                'assigned_by' => $request->user()->id,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Hardware assigned successfully',
                'data' => ['hardware' => $hardware->fresh('assignedUser')],
            ], 200);

        } catch (ValidationException $exception) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'error' => $exception->getMessage(),
            ], 422);

        } catch (ModelNotFoundException $exception) {
            return response()->json([
                'success' => false,
                'message' => 'Hardware not found',
            ], 404);

        } catch (\Exception $exception) {
            Log::error('Failed to assign hardware', ['error' => $exception->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to assign hardware',
            ], 500);
        }
    }

    /**
     * Unassign hardware from a user (return to pool)
     *
     * @route POST /api/hardware/{id}/unassign
     * @access admin, super_admin
     */
    public function unassign(Request $request, int $id): JsonResponse
    {
        try {
            $hardware = Hardware::findOrFail($id);

            if (!$hardware->isAssigned()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Hardware is currently unassigned.',
                ], 422);
            }

            $previousUserId = $hardware->assigned_to;

            $hardware->update([
                'assigned_to' => null,
                'assigned_at' => null,
                'status' => 'in_pool',
            ]);

            Log::info('Hardware unassigned', [
                'hardware_id' => $hardware->id,
                'unassigned_from' => $previousUserId,
                'unassigned_by' => $request->user()->id,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Hardware unassigned successfully and returned to pool',
                'data' => ['hardware' => $hardware->fresh()],
            ], 200);

        } catch (ModelNotFoundException $exception) {
            return response()->json([
                'success' => false,
                'message' => 'Hardware not found',
            ], 404);
        } catch (\Exception $exception) {
            Log::error('Failed to unassign hardware', ['error' => $exception->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to unassign hardware',
            ], 500);
        }
    }
}
