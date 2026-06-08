<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Software;
use App\Models\User;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

/**
 * SoftwareController
 *
 * Handles software license management:
 * - List all software
 * - Create software license
 * - Update software license
 * - Delete software license
 * - Assign software to user
 * - Unassign software from user
 */
class SoftwareController extends Controller
{
    /**
     * List all software licenses
     *
     * @route GET /api/software
     * @access admin, super_admin
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $query = Software::with('users');

            if ($request->has('category')) {
                $query->where('category', $request->category);
            }
            if ($request->has('status')) {
                $query->where('status', $request->status);
            }

            $software = $query->orderBy('category')
                ->orderBy('name')
                ->get();

            return response()->json([
                'success' => true,
                'data' => ['software' => $software],
            ], 200);

        } catch (\Exception $exception) {
            Log::error("Failed to list software: ", ['error' => $exception->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve software'
            ], 500);
        }
    }

    /**
     * Get a single software license
     *
     * @route GET /api/software/{id}
     * @access admin, super_admin
     */
    public function show(int $id): JsonResponse
    {
        try {
            $software = Software::with('users')->findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => ['software' => $software],
            ], 200);

        } catch (ModelNotFoundException $exception) {
            return response()->json([
                'success' => false,
                'message' => 'Software not found'
            ], 404);

        } catch (\Exception $exception) {
            Log::error("Failed to retrieve software: ", ['error' => $exception->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve software'
            ], 500);
        }
    }

    /**
     * Create a new software license
     *
     * @route POST /api/software
     * @access admin, super_admin
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'category' => 'required|string|in:os,office_suite,antivirus,business',
                'version' => 'nullable|string|max:50',
                'license_key' => 'nullable|string|max:255',
                'license_expiry' => 'nullable|date',
                'status' => 'required|string|in:active,expired,retired',
                'notes' => 'nullable|string',
            ]);

            $software = Software::create($validated);

            Log::info('Software created', [
                'software_id' => $software->id,
                'created_by' => $request->user()->id
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Software created successfully',
                'data' => ['software' => $software],
            ], 201);

        } catch (ValidationException $exception) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $exception->errors()
            ], 422);

        } catch (\Exception $exception) {
            Log::error("Failed to create software: ", ['error' => $exception->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to create software'
            ], 500);
        }
    }

    /**
     * Update a software license
     *
     * @route PUT /api/software/{if}
     * @access admin, super_admin
     */
    public function update(Request $request, int $id): JsonResponse
    {
        try {
            $software = Software::findOrFail($id);

            $validated = $request->validate([
                'name' => 'sometimes|string|max:255',
                'category' => 'sometimes|string|in:os,office_suite,antivirus,business',
                'version' => 'nullable|string|max:50',
                'license_key' => 'nullable|string|max:255',
                'license_expiry' => 'nullable|date',
                'status' => 'sometimes|string|in:active,expired,retired',
                'notes' => 'nullable|string',
            ]);

            $software->update($validated);

            Log::info('Software updated', [
                'software_id' => $software->id,
                'updated_by' => $request->user()->id
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Software updated successfully',
                'data' => ['software' => $software->fresh('users')],
            ], 200);

        } catch (ValidationException $exception) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $exception->errors()
            ], 422);
        } catch (ModelNotFoundException $exception) {
            return response()->json([
                'success' => false,
                'message' => 'Software not found'
            ], 404);
        } catch (\Exception $exception) {
            Log::error("Failed to update software: ", ['error' => $exception->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to update software'
            ], 500);
        }
    }

    /**
     * Delete a software license
     * Only allowed if not assigned to any user
     *
     * @route DELETE /api/software/{id}
     * @access admin, super_admin
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        try {
            $software = Software::with('users')->findOrFail($id);

            if ($software->users->count() > 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot delete software assigned to users. Unassign it first.',
                ], 422);
            }

            $software->delete();

            Log::info('Software deleted', [
                'software_id' => $software->id,
                'deleted_by' => $request->user()->id
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Software deleted successfully',
            ], 200);
        } catch (ModelNotFoundException $exception) {
            return response()->json([
                'success' => false,
                'message' => 'Software not found'
            ], 404);
        } catch (\Exception $exception) {
            Log::error("Failed to delete software: ", ['error' => $exception->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete software',
            ], 500);
        }
    }

    /**
     * Assign software to a user
     *
     * @route POST /api/software/{id}/assign
     * @access admin, super_admin
     */
    public function assign(Request $request, int $id): JsonResponse
    {
        try {
            $software = Software::findOrFail($id);

            $validated = $request->validate([
                'user_id' => 'required|exists:users,id'
            ]);

            // Check if already assigned to this user
            if  ($software->users()->where('user_id', $validated['user_id'])->exists()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Software is already assigned to this user.',
                ], 422);
            }

            if ($software->status === 'retired') {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot assign retired software.',
                ], 422);
            }

            $software->users()->attach($validated['user_id'], [
                'assigned_at' => now(),
            ]);

            Log::info('Software assigned', [
                'software_id' => $software->id,
                'user_id' => $validated['user_id'],
                'assigned_by' => $request->user()->id,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Software assigned successfully',
                'data' => ['software' => $software->fresh('users')],
            ], 200);

        } catch (ValidationException $exception) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $exception->errors()
            ], 422);

        } catch (ModelNotFoundException $exception) {
            return response()->json([
                'success' => false,
                'message' => 'Software not found'
            ], 404);

        } catch (\Exception $exception) {
            Log::error("Failed to assign software: ", ['error' => $exception->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to assign software',
            ], 500);
        }
    }

    /**
     * Unassign software from a user
     *
     * @route POST /api/software/{id}/unassign
     * @access admin, super_admin
     */
    public function unassign(Request $request, int $id): JsonResponse
    {
        try {
            $software = Software::findOrFail($id);

            $validated = $request->validate([
                'user_id' => 'required|exists:users,id',
            ]);

            if (!$software->users()->where('user_id', $validated['user_id'])->exists()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Software is not assigned to this user.',
                ], 422);
            }

            $software->users()->detach($validated['user_id']);

            Log::info('Software unassigned', [
                'software_id' => $software->id,
                'user_id' => $validated['user_id'],
                'unassigned_by' => $request->user()->id,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Software unassigned successfully',
                'data' => ['software' => $software->fresh('users')],
            ], 200);

        } catch (ValidationException $exception) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $exception->errors()
            ], 422);

        } catch (ModelNotFoundException $exception) {
            return response()->json([
                'success' => false,
                'message' => 'Software not found'
            ], 404);

        } catch (\Exception $exception) {
            Log::error("Failed to unassign software: ", ['error' => $exception->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to unassign software',
            ], 500);
        }
    }
}
