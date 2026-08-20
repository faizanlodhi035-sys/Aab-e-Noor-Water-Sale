<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InventoryTransaction extends Model
{
    use HasFactory;

    protected $fillable = ['product_id','salesman_id','type','quantity','previous_stock','new_stock','reference_type','reference_id','notes','transaction_date'];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function salesman()
    {
        return $this->belongsTo(Salesman::class);
    }
}
