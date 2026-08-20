<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class AuthSeeder extends Seeder
{
    public function run(): void
    {
        // Development-only credentials
        // Admin: admin@local / password: secret123
        // Salesmen: sales1@local / password: secret123, sales2@local / password: secret123

        User::updateOrCreate(['email'=>'admin@local'], [
            'name'=>'Admin','email'=>'admin@local','password'=>Hash::make('secret123'),'role'=>'admin','is_active'=>true
        ]);

        User::updateOrCreate(['email'=>'sales1@local'], [
            'name'=>'Sales One','email'=>'sales1@local','password'=>Hash::make('secret123'),'role'=>'salesman','is_active'=>true
        ]);

        User::updateOrCreate(['email'=>'sales2@local'], [
            'name'=>'Sales Two','email'=>'sales2@local','password'=>Hash::make('secret123'),'role'=>'salesman','is_active'=>true
        ]);
    }
}
