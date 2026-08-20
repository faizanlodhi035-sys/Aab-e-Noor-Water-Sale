<?php

use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\CustomerController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\InventoryController;
use App\Http\Controllers\Api\ExpenseController;
use App\Http\Controllers\Api\SalesmanController;


/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
*/

Route::post('login', [AuthController::class, 'login']);


/*
|--------------------------------------------------------------------------
| Authenticated Routes
|--------------------------------------------------------------------------
*/

Route::middleware(['auth:sanctum'])->group(function () {

    Route::post('logout', [\App\Http\Controllers\Api\AuthController::class, 'logout']);
    Route::get('user', [\App\Http\Controllers\Api\AuthController::class, 'user']);

    Route::put(
        'user/password',
        [\App\Http\Controllers\Api\AuthController::class, 'changePassword']
    );

    // Admin only
    Route::apiResource('salesmen', SalesmanController::class)
        ->middleware('role:admin');

    Route::apiResource('products', ProductController::class);
    Route::apiResource('customers', CustomerController::class);
    Route::apiResource('orders', OrderController::class);

    Route::get('payments', [PaymentController::class, 'index']);
    Route::get('payments/{id}', [PaymentController::class, 'show']);
    Route::post('payments', [PaymentController::class, 'store']);

    Route::get(
        'inventory/transactions',
        [InventoryController::class, 'transactions']
    );

    Route::post(
        'inventory/adjustment',
        [InventoryController::class, 'adjust']
    );

    Route::apiResource('expenses', ExpenseController::class);
});
    /*
    |--------------------------------------------------------------------------
    | Authentication
    |--------------------------------------------------------------------------
    */

    Route::post('logout', [AuthController::class, 'logout']);
    Route::get('user', [AuthController::class, 'user']);


    /*
    |--------------------------------------------------------------------------
    | PRODUCTS
    |--------------------------------------------------------------------------
    |
    | Admin: Full CRUD
    | Salesman: View only
    |
    */

    Route::get('products', [ProductController::class, 'index']);
    Route::get('products/{product}', [ProductController::class, 'show']);

    Route::middleware('role:admin')->group(function () {
        Route::post('products', [ProductController::class, 'store']);
        Route::put('products/{product}', [ProductController::class, 'update']);
        Route::patch('products/{product}', [ProductController::class, 'update']);
        Route::delete('products/{product}', [ProductController::class, 'destroy']);
    });


    /*
    |--------------------------------------------------------------------------
    | CUSTOMERS
    |--------------------------------------------------------------------------
    |
    | Admin: All customers
    | Salesman: Customers endpoint
    |
    */

    Route::apiResource('customers', CustomerController::class);


    /*
    |--------------------------------------------------------------------------
    | ORDERS / SALES
    |--------------------------------------------------------------------------
    |
    | Admin: All orders
    | Salesman: Own orders only
    |
    */

    Route::apiResource('orders', OrderController::class);


    /*
    |--------------------------------------------------------------------------
    | PAYMENTS
    |--------------------------------------------------------------------------
    |
    | Admin only
    |
    */

    Route::middleware('role:admin')->group(function () {

        Route::get('payments', [PaymentController::class, 'index']);
        Route::get('payments/{id}', [PaymentController::class, 'show']);
        Route::post('payments', [PaymentController::class, 'store']);

    });


    /*
    |--------------------------------------------------------------------------
    | INVENTORY
    |--------------------------------------------------------------------------
    |
    | Admin only
    |
    */

    Route::middleware('role:admin')->group(function () {

        Route::get(
            'inventory/transactions',
            [InventoryController::class, 'transactions']
        );

        Route::post(
            'inventory/adjustment',
            [InventoryController::class, 'adjust']
        );

    });


    /*
    |--------------------------------------------------------------------------
    | EXPENSES
    |--------------------------------------------------------------------------
    |
    | Admin only
    |
    */

    Route::middleware('role:admin')->group(function () {

        Route::apiResource('expenses', ExpenseController::class);

    });


    /*
    |--------------------------------------------------------------------------
    | SALESMEN MANAGEMENT
    |--------------------------------------------------------------------------
    |
    | Admin only
    |
    */

    Route::middleware('role:admin')->group(function () {

        Route::apiResource('salesmen', SalesmanController::class);

    });
