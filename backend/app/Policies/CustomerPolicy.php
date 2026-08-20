<?php

namespace App\Policies;

use App\Models\Customer;
use App\Models\User;

class CustomerPolicy
{
    public function view(User $user, Customer $customer)
    {
        if ($user->role === 'admin') return true;
        return $customer->assigned_salesman_id === $user->id;
    }

    public function create(User $user)
    {
        return in_array($user->role, ['admin','salesman']);
    }

    public function update(User $user, Customer $customer)
    {
        if ($user->role === 'admin') return true;
        return $customer->assigned_salesman_id === $user->id;
    }

    public function delete(User $user, Customer $customer)
    {
        return $user->role === 'admin';
    }
}
