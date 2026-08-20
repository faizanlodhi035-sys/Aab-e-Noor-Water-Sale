<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Customer extends Model
{
    use HasFactory;

    protected $fillable = [
        'customer_code','name','shop_name','phone','alternate_phone','address','area','opening_balance','outstanding_balance','assigned_salesman_id','status','photo'
    ];

    public function salesman()
    {
        return $this->belongsTo(Salesman::class, 'assigned_salesman_id');
    }

    public function orders()
    {
        return $this->hasMany(Order::class);
    }

    public function payments()
    {
        return $this->hasMany(Payment::class);
    }
}
