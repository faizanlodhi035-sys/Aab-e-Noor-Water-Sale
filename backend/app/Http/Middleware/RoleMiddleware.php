<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class RoleMiddleware
{
    /**
     * Handle an incoming request.
     * Usage: ->middleware('role:admin')
     */
    public function handle(Request $request, Closure $next, $role)
    {
        $user = $request->user();
        if (! $user) {
            return response()->json(['success'=>false,'message'=>'Unauthenticated'],401);
        }
        if ($user->role !== $role) {
            return response()->json(['success'=>false,'message'=>'Forbidden'],403);
        }
        return $next($request);
    }
}
