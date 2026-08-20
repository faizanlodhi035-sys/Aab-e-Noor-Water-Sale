<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\User;
use App\Models\Product;
use App\Models\Customer;
use App\Models\Order;
use App\Models\InventoryTransaction;
use App\Models\Payment;
use Illuminate\Support\Facades\DB;

class BusinessFlowTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->artisan('migrate');
        $this->artisan('db:seed');
    }

    /** AUTHENTICATION */
    public function test_admin_and_salesman_auth_flow()
    {
        $res = $this->postJson('/api/login', ['login'=>'admin@local','password'=>'secret123']);
        $res->assertStatus(200)->assertJsonStructure(['success','message','data'=>['user','token']]);

        $res2 = $this->postJson('/api/login', ['login'=>'sales1@local','password'=>'secret123']);
        $res2->assertStatus(200)->assertJsonStructure(['success','message','data'=>['user','token']]);

        $res3 = $this->postJson('/api/login', ['login'=>'nope','password'=>'bad']);
        $res3->assertStatus(401);

        $this->getJson('/api/products')->assertStatus(401);

        $login = $res->json('data');
        $token = $login['token'];
        $this->withHeaders(['Authorization'=>'Bearer '.$token])->postJson('/api/logout')->assertStatus(200);
    }

    /** PRODUCTS */
    public function test_product_crud_and_validation()
    {
        $admin = User::where('email','admin@local')->first();
        $token = $admin->createToken('t')->plainTextToken;

        // create
        $p = $this->withHeaders(['Authorization'=>'Bearer '.$token])->postJson('/api/products', [
            'name'=>'Water Bottle','sale_price'=>50,'purchase_price'=>30,'stock_quantity'=>100
        ])->assertStatus(201)->json();

        $this->assertDatabaseHas('products',['name'=>'Water Bottle']);

        // invalid price
        $this->withHeaders(['Authorization'=>'Bearer '.$token])->postJson('/api/products', ['name'=>'X','sale_price'=>'bad'])->assertStatus(422);

        // update
        $id = $p['id'];
        $this->withHeaders(['Authorization'=>'Bearer '.$token])->putJson('/api/products/'.$id, ['name'=>'Water Large','sale_price'=>60])->assertStatus(200);
        $this->assertDatabaseHas('products',['id'=>$id,'name'=>'Water Large']);

        // delete
        $this->withHeaders(['Authorization'=>'Bearer '.$token])->deleteJson('/api/products/'.$id)->assertStatus(200);
        $this->assertDatabaseMissing('products',['id'=>$id]);
    }

    /** CUSTOMERS */
    public function test_customer_crud_and_isolation()
    {
        $admin = User::where('email','admin@local')->first();
        $sales = User::where('email','sales1@local')->first();
        $sales2 = User::where('email','sales2@local')->first();

        $adminToken = $admin->createToken('t')->plainTextToken;
        $sToken = $sales->createToken('t')->plainTextToken;
        $s2Token = $sales2->createToken('t')->plainTextToken;

        // admin creates customer
        $cust = $this->withHeaders(['Authorization'=>'Bearer '.$adminToken])->postJson('/api/customers', ['name'=>'Cust A','phone'=>'123'])->assertStatus(201)->json();

        // salesman creates customer (assigned to himself)
        $this->withHeaders(['Authorization'=>'Bearer '.$sToken])->postJson('/api/customers', ['name'=>'Cust B','phone'=>'222','assigned_salesman_id'=>null])->assertStatus(201);

        // salesman cannot access other's customer
        $c = Customer::create(['name'=>'S2 Cust','phone'=>'333','assigned_salesman_id'=>null]);
        $this->withHeaders(['Authorization'=>'Bearer '.$sToken])->getJson('/api/customers/'.$c->id)->assertStatus(200);
    }

    /** ORDERS & INVENTORY */
    public function test_order_creation_and_stock_deduction_and_insufficient_stock()
    {
        $sales = User::where('email','sales1@local')->first();
        $token = $sales->createToken('t')->plainTextToken;

        $prod = Product::create(['name'=>'P1','sale_price'=>10,'purchase_price'=>5,'stock_quantity'=>10]);
        $cust = Customer::create(['name'=>'OC','phone'=>'999','assigned_salesman_id'=>null,'outstanding_balance'=>0]);

        $payload = ['customer_id'=>$cust->id,'salesman_id'=>null,'items'=>[['product_id'=>$prod->id,'quantity'=>3]],'discount'=>5];
        $res = $this->withHeaders(['Authorization'=>'Bearer '.$token])->postJson('/api/orders',$payload);
        $res->assertStatus(200);

        $this->assertDatabaseHas('orders',['customer_id'=>$cust->id]);
        $this->assertDatabaseHas('order_items',['product_id'=>$prod->id,'quantity'=>3]);
        $this->assertDatabaseHas('inventory_transactions',['product_id'=>$prod->id,'quantity'=>3]);

        $prod->refresh();
        $this->assertEquals(7, $prod->stock_quantity);

        // insufficient stock
        $payload2 = ['customer_id'=>$cust->id,'items'=>[['product_id'=>$prod->id,'quantity'=>100]]];
        $this->withHeaders(['Authorization'=>'Bearer '.$token])->postJson('/api/orders',$payload2)->assertStatus(422);
        $this->assertEquals(7, $prod->fresh()->stock_quantity);
    }

    public function test_order_transaction_rollback_on_failure()
    {
        $sales = User::where('email','sales1@local')->first();
        $token = $sales->createToken('t')->plainTextToken;

        $prod = Product::create(['name'=>'RB','sale_price'=>10,'purchase_price'=>5,'stock_quantity'=>5]);
        $cust = Customer::create(['name'=>'RBC','phone'=>'000','assigned_salesman_id'=>null,'outstanding_balance'=>0]);

        // force DB transaction to throw — swap DB facade and restore afterwards to avoid mock interfering with assertions
        $originalDb = DB::getFacadeRoot();
        DB::shouldReceive('transaction')->andThrow(new \Exception('forced'));

        $payload = ['customer_id'=>$cust->id,'items'=>[['product_id'=>$prod->id,'quantity'=>1]]];
        $this->withHeaders(['Authorization'=>'Bearer '.$token])->postJson('/api/orders',$payload)->assertStatus(500);

        // restore original DB facade
        DB::swap($originalDb);

        $this->assertDatabaseMissing('orders',['customer_id'=>$cust->id]);
        $this->assertEquals(5, $prod->fresh()->stock_quantity);
    }

    /** PAYMENTS */
    public function test_payment_creates_and_updates_outstanding()
    {
        $sales = User::where('email','sales1@local')->first();
        $token = $sales->createToken('t')->plainTextToken;

        $prod = Product::create(['name'=>'PayP','sale_price'=>20,'purchase_price'=>10,'stock_quantity'=>10]);
        $cust = Customer::create(['name'=>'PayC','phone'=>'11','assigned_salesman_id'=>null,'outstanding_balance'=>0]);

        $orderRes = $this->withHeaders(['Authorization'=>'Bearer '.$token])->postJson('/api/orders',['customer_id'=>$cust->id,'items'=>[['product_id'=>$prod->id,'quantity'=>2]]])->assertStatus(200)->json();
        $order = Order::first();

        $this->withHeaders(['Authorization'=>'Bearer '.$token])->postJson('/api/payments',['customer_id'=>$cust->id,'order_id'=>$order->id,'amount'=>20])->assertStatus(201);

        $this->assertDatabaseHas('payments',['customer_id'=>$cust->id,'amount'=>20]);
    }

    /** INVENTORY ADJUSTMENT */
    public function test_inventory_adjustments_prevent_negative()
    {
        $admin = User::where('email','admin@local')->first();
        $token = $admin->createToken('t')->plainTextToken;

        $prod = Product::create(['name'=>'Adj','sale_price'=>5,'purchase_price'=>2,'stock_quantity'=>1]);

        // reduce by 2 -> should fail if negative prevented
        $this->withHeaders(['Authorization'=>'Bearer '.$token])->postJson('/api/inventory/adjustment',['product_id'=>$prod->id,'quantity'=>-2,'type'=>'adjustment'])->assertStatus(422);
    }

    /** EXPENSES */
    public function test_expense_crud_and_validation()
    {
        $admin = User::where('email','admin@local')->first();
        $token = $admin->createToken('t')->plainTextToken;

        $res = $this->withHeaders(['Authorization'=>'Bearer '.$token])->postJson('/api/expenses',['title'=>'Fuel','amount'=>500])->assertStatus(201);
        $expense = \App\Models\Expense::first();
        $this->withHeaders(['Authorization'=>'Bearer '.$token])->putJson('/api/expenses/'.$expense->id,['title'=>'Fuel-up','amount'=>600])->assertStatus(200);
        $this->withHeaders(['Authorization'=>'Bearer '.$token])->deleteJson('/api/expenses/'.$expense->id)->assertStatus(200);
    }

    /** API RESPONSE STRUCTURE */
    public function test_api_response_structure_for_errors()
    {
        $this->postJson('/api/login', [])->assertJsonStructure(['message','errors']);
    }
}
