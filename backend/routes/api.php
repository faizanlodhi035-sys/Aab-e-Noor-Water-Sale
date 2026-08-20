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

Route::middleware('auth:sanctum')->group(function () {

    /*
    |--------------------------------------------------------------------------
    | Authentication
    |--------------------------------------------------------------------------
    */

    Route::post('logout', [AuthController::class, 'logout']);
    Route::get('user', [AuthController::class, 'user']);

    Route::put(
        'user/password',
        [AuthController::class, 'changePassword']
    );


    /*
    |--------------------------------------------------------------------------
    | SALESMEN
    |--------------------------------------------------------------------------
    |
    | Admin only
    |
    */

    Route::apiResource('salesmen', SalesmanController::class)
        ->middleware('role:admin');


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
    | Admin + Salesman
    |
    */

    Route::apiResource('customers', CustomerController::class);


    /*
    |--------------------------------------------------------------------------
    | ORDERS / SALES
    |--------------------------------------------------------------------------
    |
    | Admin + Salesman
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

});