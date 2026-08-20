<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\User;

class Salesman extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'phone',
        'email',
        'username',
        'password',
        'status'
    ];

    public function user()
    {
        return $this->hasOne(User::class);
    }

    public function customers()
    {
        return $this->hasMany(Customer::class, 'assigned_salesman_id');
    }

    public function orders()
    {
        return $this->hasMany(Order::class);
    }

    public function payments()
    {
        return $this->hasMany(Payment::class);
    }

    public function expenses()
    {
        return $this->hasMany(Expense::class);
    }
}