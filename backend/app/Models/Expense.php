<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Expense extends Model
{
    use HasFactory;

    protected $fillable = ['salesman_id','title','category','amount','expense_date','description'];

    public function salesman()
    {
        return $this->belongsTo(Salesman::class);
    }
}
