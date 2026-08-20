<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Ensure routes/api.php is loaded when RouteServiceProvider is not present
        $api = base_path('routes/api.php');
        if (file_exists($api)) {
            \Illuminate\Support\Facades\Route::prefix('api')->middleware('api')->group($api);
        }

        // register role middleware
        \Illuminate\Support\Facades\Route::aliasMiddleware('role', \App\Http\Middleware\RoleMiddleware::class);

        // register policies
        \Illuminate\Support\Facades\Gate::policy(\App\Models\Customer::class, \App\Policies\CustomerPolicy::class);
        \Illuminate\Support\Facades\Gate::policy(\App\Models\Order::class, \App\Policies\OrderPolicy::class);
    }
}
