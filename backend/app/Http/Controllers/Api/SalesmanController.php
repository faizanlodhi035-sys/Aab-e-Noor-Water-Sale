<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Salesman;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class SalesmanController extends Controller
{
    /**
     * List all salesmen
     */
    public function index(): JsonResponse
    {
        $items = Salesman::with('user')
            ->orderBy('name')
            ->get();

        return response()->json($items);
    }

    /**
     * Create salesman + login account
     */
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'nullable|string|max:50',
            'email' => 'required|email|unique:salesmen,email|unique:users,email',
            'username' => 'nullable|string|max:100|unique:salesmen,username',
            'password' => 'required|string|min:6',
            'status' => 'boolean',
        ]);

        $salesman = DB::transaction(function () use ($data) {

            $salesman = Salesman::create([
                'name' => $data['name'],
                'phone' => $data['phone'] ?? null,
                'email' => $data['email'],
                'username' => $data['username'] ?? null,
                // Do NOT store plain password
                'password' => null,
                'status' => $data['status'] ?? true,
            ]);

            User::create([
                'name' => $salesman->name,
                'email' => $salesman->email,
                'password' => $data['password'],
                'role' => 'salesman',
                'is_active' => $salesman->status,
                'salesman_id' => $salesman->id,
            ]);

            return $salesman;
        });

        return response()->json([
            'success' => true,
            'message' => 'Salesman account created successfully',
            'data' => $salesman->load('user'),
        ], 201);
    }

    /**
     * Show salesman
     */
    public function show($id): JsonResponse
    {
        $salesman = Salesman::with('user')->findOrFail($id);

        return response()->json($salesman);
    }

    /**
     * Update salesman + login account
     */
    public function update(Request $request, $id): JsonResponse
    {
        $salesman = Salesman::findOrFail($id);

        $data = $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'nullable|string|max:50',
            'email' => 'required|email|unique:salesmen,email,' . $salesman->id . '|unique:users,email,' . optional($salesman->user)->id,
            'username' => 'nullable|string|max:100|unique:salesmen,username,' . $salesman->id,
            'password' => 'nullable|string|min:6',
            'status' => 'boolean',
        ]);

        DB::transaction(function () use ($data, $salesman) {

            $salesman->update([
                'name' => $data['name'],
                'phone' => $data['phone'] ?? null,
                'email' => $data['email'],
                'username' => $data['username'] ?? null,
                'status' => $data['status'] ?? true,
            ]);

            $user = $salesman->user;

            if ($user) {
                $user->name = $salesman->name;
                $user->email = $salesman->email;
                $user->is_active = $salesman->status;

                if (!empty($data['password'])) {
                    $user->password = $data['password'];

                    // Logout existing sessions after password reset
                    $user->tokens()->delete();
                }

                $user->save();
            }
        });

        return response()->json([
            'success' => true,
            'message' => 'Salesman updated successfully',
            'data' => $salesman->fresh()->load('user'),
        ]);
    }

    /**
     * Deactivate salesman and login account
     *
     * We do not permanently delete the record because
     * old orders and sales history may depend on it.
     */
    public function destroy($id): JsonResponse
    {
        $salesman = Salesman::findOrFail($id);

        DB::transaction(function () use ($salesman) {

            $salesman->update([
                'status' => false,
            ]);

            if ($salesman->user) {
                $salesman->user->update([
                    'is_active' => false,
                ]);

                $salesman->user->tokens()->delete();
            }
        });

        return response()->json([
            'success' => true,
            'message' => 'Salesman account deactivated successfully',
        ]);
    }
}