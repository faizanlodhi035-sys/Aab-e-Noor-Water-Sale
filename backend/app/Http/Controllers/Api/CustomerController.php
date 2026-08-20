<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class CustomerController extends Controller
{
    public function index(): JsonResponse
    {
        $customers = Customer::orderBy('name')->get();

        return response()->json($customers);
    }

    public function show($id): JsonResponse
    {
        $customer = Customer::findOrFail($id);

        return response()->json($customer);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'customer_code' => 'nullable|string|unique:customers,customer_code',
            'name' => 'required|string',
            'shop_name' => 'nullable|string',
            'phone' => 'nullable|string',
            'alternate_phone' => 'nullable|string',
            'address' => 'nullable|string',
            'area' => 'nullable|string',
            'opening_balance' => 'numeric',
            'assigned_salesman_id' => 'nullable|exists:salesmen,id',
            'status' => 'boolean',
            'photo' => 'nullable|image|mimes:jpeg,jpg,png,webp|max:5120',
        ]);

        if ($request->hasFile('photo')) {
            $data['photo'] = $request
                ->file('photo')
                ->store('customers', 'public');
        }

        $customer = Customer::create($data);

        return response()->json($customer, 201);
    }

    public function update(Request $request, $id): JsonResponse
    {
        $customer = Customer::findOrFail($id);

        $data = $request->validate([
            'customer_code' => 'nullable|string|unique:customers,customer_code,' . $customer->id,
            'name' => 'required|string',
            'shop_name' => 'nullable|string',
            'phone' => 'nullable|string',
            'alternate_phone' => 'nullable|string',
            'address' => 'nullable|string',
            'area' => 'nullable|string',
            'opening_balance' => 'numeric',
            'assigned_salesman_id' => 'nullable|exists:salesmen,id',
            'status' => 'boolean',
            'photo' => 'nullable|image|mimes:jpeg,jpg,png,webp|max:5120',
        ]);

        if ($request->hasFile('photo')) {
            $data['photo'] = $request
                ->file('photo')
                ->store('customers', 'public');
        }

        $customer->update($data);

        return response()->json($customer);
    }

    public function destroy($id): JsonResponse
    {
        $customer = Customer::findOrFail($id);

        $customer->delete();

        return response()->json([
            'message' => 'deleted',
        ]);
    }
}