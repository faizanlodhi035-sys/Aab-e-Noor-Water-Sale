<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\InventoryTransaction;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\JsonResponse;

class InventoryController extends Controller
{
    public function transactions(): JsonResponse
    {
        $tx = InventoryTransaction::with('product')->orderByDesc('transaction_date')->get();
        return response()->json($tx);
    }

    public function adjust(Request $request): JsonResponse
    {
        $data = $request->validate([
            'product_id' => 'required|exists:products,id',
            'quantity' => 'required|integer',
            'type' => 'required|in:purchase,sale,adjustment,return',
            'notes' => 'nullable|string',
        ]);

        return DB::transaction(function () use ($data) {
            $product = Product::lockForUpdate()->findOrFail($data['product_id']);
            $previous = $product->stock_quantity;
            $new = $previous + $data['quantity'];
            if ($new < 0) abort(422, 'Resulting stock would be negative');
            $product->stock_quantity = $new;
            $product->save();

            $tx = InventoryTransaction::create([
                'product_id' => $product->id,
                'salesman_id' => null,
                'type' => $data['type'],
                'quantity' => $data['quantity'],
                'previous_stock' => $previous,
                'new_stock' => $new,
                'notes' => $data['notes'] ?? null,
                'transaction_date' => now(),
            ]);

            return response()->json($tx,201);
        });
    }
}
