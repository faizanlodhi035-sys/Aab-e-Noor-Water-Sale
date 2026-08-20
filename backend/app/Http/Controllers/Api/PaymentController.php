<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\Order;
use App\Models\Customer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\JsonResponse;

class PaymentController extends Controller
{
    public function index(): JsonResponse
    {
        $payments = Payment::with('customer','order')->orderByDesc('payment_date')->get();
        return response()->json($payments);
    }

    public function show($id): JsonResponse
    {
        $payment = Payment::with('customer','order')->findOrFail($id);
        return response()->json($payment);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'customer_id' => 'required|exists:customers,id',
            'salesman_id' => 'nullable|exists:salesmen,id',
            'order_id' => 'nullable|exists:orders,id',
            'amount' => 'required|numeric|min:0.01',
            'payment_method' => 'nullable|string',
            'payment_date' => 'nullable|date',
            'notes' => 'nullable|string',
        ]);

        return DB::transaction(function () use ($data) {
            $customer = Customer::findOrFail($data['customer_id']);
            $payment = Payment::create([
                'payment_number' => 'PAY-'.time(),
                'customer_id' => $data['customer_id'],
                'salesman_id' => $data['salesman_id'] ?? null,
                'order_id' => $data['order_id'] ?? null,
                'amount' => $data['amount'],
                'payment_method' => $data['payment_method'] ?? null,
                'payment_date' => $data['payment_date'] ?? now(),
                'notes' => $data['notes'] ?? null,
            ]);

            // update customer outstanding
            $customer->outstanding_balance = $customer->outstanding_balance - $payment->amount;
            if ($customer->outstanding_balance < 0) $customer->outstanding_balance = 0;
            $customer->save();

            // update order if exists
            if (!empty($data['order_id'])) {
                $order = Order::findOrFail($data['order_id']);
                $order->paid_amount = $order->paid_amount + $payment->amount;
                $order->outstanding_amount = max(0, $order->total - $order->paid_amount);
                $order->payment_status = $order->outstanding_amount <= 0 ? 'paid' : 'partial';
                $order->save();
            }

            return response()->json($payment, 201);
        });
    }
}
