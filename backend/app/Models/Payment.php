<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    use HasFactory;

    protected $fillable = ['payment_number','customer_id','salesman_id','order_id','amount','payment_method','payment_date','notes'];

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function salesman()
    {
        return $this->belongsTo(Salesman::class);
    }

    public function order()
    {
        return $this->belongsTo(Order::class);
    }
}
