<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Expense;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ExpenseController extends Controller
{
    public function index(): JsonResponse
    {
        $expenses = Expense::orderByDesc('expense_date')->get();
        return response()->json($expenses);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'salesman_id' => 'nullable|exists:salesmen,id',
            'title' => 'required|string',
            'category' => 'nullable|string',
            'amount' => 'required|numeric',
            'expense_date' => 'nullable|date',
            'description' => 'nullable|string',
        ]);

        $expense = Expense::create($data);
        return response()->json($expense,201);
    }

    public function show($id): JsonResponse
    {
        $expense = Expense::findOrFail($id);
        return response()->json($expense);
    }

    public function update(Request $request, $id): JsonResponse
    {
        $expense = Expense::findOrFail($id);
        $data = $request->validate([
            'title' => 'required|string',
            'category' => 'nullable|string',
            'amount' => 'required|numeric',
            'expense_date' => 'nullable|date',
            'description' => 'nullable|string',
        ]);
        $expense->update($data);
        return response()->json($expense);
    }

    public function destroy($id): JsonResponse
    {
        $expense = Expense::findOrFail($id);
        $expense->delete();
        return response()->json(['message'=>'deleted']);
    }
}
