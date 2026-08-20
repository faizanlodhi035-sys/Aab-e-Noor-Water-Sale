<?php

namespace App\Policies;

use App\Models\Order;
use App\Models\User;

class OrderPolicy
{
    public function view(User $user, Order $order)
    {
        if ($user->role === 'admin') return true;
        return $order->salesman_id === $user->id;
    }

    public function create(User $user)
    {
        return in_array($user->role, ['admin','salesman']);
    }

    public function update(User $user, Order $order)
    {
        if ($user->role === 'admin') return true;
        return $order->salesman_id === $user->id;
    }

    public function delete(User $user, Order $order)
    {
        return $user->role === 'admin';
    }
}
