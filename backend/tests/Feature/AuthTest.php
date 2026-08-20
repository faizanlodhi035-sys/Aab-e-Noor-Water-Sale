<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\User;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->artisan('migrate');
        $this->artisan('db:seed');
    }

    public function test_admin_login()
    {
        $res = $this->postJson('/api/login', ['login'=>'admin@local','password'=>'secret123']);
        $res->assertStatus(200)->assertJsonStructure(['success','message','data'=>['user','token']]);
    }

    public function test_salesman_login()
    {
        $res = $this->postJson('/api/login', ['login'=>'sales1@local','password'=>'secret123']);
        $res->assertStatus(200)->assertJsonStructure(['success','message','data'=>['user','token']]);
    }

    public function test_invalid_login()
    {
        $res = $this->postJson('/api/login', ['login'=>'nope','password'=>'bad']);
        $res->assertStatus(401);
    }

    public function test_protected_endpoint_requires_token()
    {
        $res = $this->getJson('/api/products');
        $res->assertStatus(401);
    }

    public function test_logout_revokes_token()
    {
        $login = $this->postJson('/api/login', ['login'=>'admin@local','password'=>'secret123'])->json('data');
        $token = $login['token'];
        $res = $this->withHeaders(['Authorization'=>'Bearer '.$token])->postJson('/api/logout');
        $res->assertStatus(200);
        $res2 = $this->withHeaders(['Authorization'=>'Bearer '.$token])->getJson('/api/products');
        $res2->assertStatus(401);
    }
}
