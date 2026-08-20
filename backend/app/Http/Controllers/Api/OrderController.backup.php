<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\InventoryTransaction;
use App\Models\Customer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\JsonResponse;

class OrderController extends Controller
{
    public function index(): JsonResponse
    {
        $orders = Order::with('customer','items')->orderByDesc('order_date')->get();
        return response()->json($orders);
    }

    public function show($id): JsonResponse
    {
        $order = Order::with('items.product','customer')->findOrFail($id);
        return response()->json($order);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'customer_id' => 'required|exists:customers,id',
            'salesman_id' => 'nullable|exists:salesmen,id',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'discount' => 'numeric',
            'notes' => 'nullable|string',
        ]);

        return DB::transaction(function () use ($data) {
            $customer = Customer::findOrFail($data['customer_id']);

            // calculate subtotal
            $subtotal = 0;
            foreach ($data['items'] as $it) {
                $product = Product::findOrFail($it['product_id']);
                $subtotal += $product->sale_price * $it['quantity'];
            }

            $discount = $data['discount'] ?? 0;
            $total = max(0, $subtotal - $discount);

            // validate stock
            foreach ($data['items'] as $it) {
                $product = Product::lockForUpdate()->findOrFail($it['product_id']);
                if ($product->stock_quantity < $it['quantity']) {
                    abort(422, 'Insufficient stock for product id '.$product->id);
                }
            }

            $order = Order::create([
                'order_number' => 'ORD-'.time(),
                'customer_id' => $data['customer_id'],
                'salesman_id' => $data['salesman_id'] ?? null,
                'order_date' => now(),
                'subtotal' => $subtotal,
                'discount' => $discount,
                'total' => $total,
                'paid_amount' => 0,
                'outstanding_amount' => $total,
                'payment_status' => 'pending',
                'order_status' => 'completed',
                'notes' => $data['notes'] ?? null,
            ]);

            // create items and deduct stock
            foreach ($data['items'] as $it) {
                $product = Product::lockForUpdate()->findOrFail($it['product_id']);
                $unitPrice = $product->sale_price;
                $lineSubtotal = $unitPrice * $it['quantity'];

                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $product->id,
                    'quantity' => $it['quantity'],
                    'unit_price' => $unitPrice,
                    'subtotal' => $lineSubtotal,
                ]);

                $previous = $product->stock_quantity;
                $product->stock_quantity = $previous - $it['quantity'];
                if ($product->stock_quantity < 0) {
                    abort(422, 'Stock cannot be negative');
                }
                $product->save();

                InventoryTransaction::create([
                    'product_id' => $product->id,
                    'salesman_id' => $order->salesman_id,
                    'type' => 'sale',
                    'quantity' => $it['quantity'],
                    'previous_stock' => $previous,
                    'new_stock' => $product->stock_quantity,
                    'reference_type' => 'order',
                    'reference_id' => $order->id,
                    'notes' => 'Sale from order '.$order->id,
                    'transaction_date' => now(),
                ]);
            }

            // update customer outstanding
            $customer->outstanding_balance = $customer->outstanding_balance + $order->outstanding_amount;
            $customer->save();

            return response()->json($order->load('items'));
        });
    }

    public function update(Request $request, $id): JsonResponse
    {
        $order = Order::findOrFail($id);
        $data = $request->only(['notes','order_status','payment_status']);
        $order->update($data);
        return response()->json($order);
    }

    public function destroy($id): JsonResponse
    {
        $order = Order::findOrFail($id);
        $order->delete();
        return response()->json(['message'=>'deleted']);
    }
}
