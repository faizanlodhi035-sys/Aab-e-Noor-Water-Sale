<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ProductController extends Controller
{
    public function index(): JsonResponse
    {
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
            'image' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:5120',
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

        if ($request->hasFile('image')) {
            $data['image'] = $request
                ->file('image')
                ->store('products', 'public');
        }

        $product = Product::create($data);

        return response()->json($product, 201);
    }

    public function update(Request $request, $id): JsonResponse
    {
        $product = Product::findOrFail($id);

        $data = $request->validate([
            'name' => 'required|string',
            'image' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:5120',
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

        if ($request->hasFile('image')) {
            $data['image'] = $request
                ->file('image')
                ->store('products', 'public');
        }

        $product->update($data);

        return response()->json($product);
    }

    public function destroy($id): JsonResponse
    {
        $product = Product::findOrFail($id);

        $product->delete();

        return response()->json([
            'message' => 'deleted',
        ]);
    }
}