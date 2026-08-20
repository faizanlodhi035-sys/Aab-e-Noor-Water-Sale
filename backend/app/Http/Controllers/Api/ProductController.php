<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Laravel\Sanctum\PersonalAccessToken;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ProductController extends Controller
{
    public function index(): JsonResponse
    {
        $token = request()->bearerToken();

        if ($token && !PersonalAccessToken::findToken($token)) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        $products = Product::orderBy('name')->get();

        return response()->json($products);
    }

    public function show($id): JsonResponse
    {
        $product = Product::findOrFail($id);

        return response()->json($product);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => 'required|string',
            'sku' => 'nullable|string',
            'category_id' => 'nullable|exists:categories,id',
            'unit' => 'nullable|string',
            'purchase_price' => 'numeric',
            'sale_price' => 'numeric',
            'mrp' => 'numeric',
            'stock_quantity' => 'integer',
            'minimum_stock' => 'integer',
            'status' => 'boolean',
        ]);

        $product = Product::create($data);

        return response()->json($product, 201);
    }

    public function update(Request $request, $id): JsonResponse
    {
        $product = Product::findOrFail($id);

        $data = $request->validate([
            'name' => 'required|string',
            'sku' => 'nullable|string',
            'category_id' => 'nullable|exists:categories,id',
            'unit' => 'nullable|string',
            'purchase_price' => 'numeric',
            'sale_price' => 'numeric',
            'mrp' => 'numeric',
            'stock_quantity' => 'integer',
            'minimum_stock' => 'integer',
            'status' => 'boolean',
        ]);

        $product->update($data);

        return response()->json($product);
    }

    public function destroy($id): JsonResponse
    {
        $product = Product::findOrFail($id);

        $product->delete();

        return response()->json(['message' => 'deleted']);
    }
}

