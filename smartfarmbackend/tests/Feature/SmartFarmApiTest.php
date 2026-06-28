<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Peternakan;
use App\Models\JenisTernak;
use App\Models\Ternak;
use App\Models\JenisPakan;
use App\Models\StokPakan;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SmartFarmApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        // Seed roles & permissions
        $this->artisan('db:seed', ['--class' => 'RolesAndPermissionsSeeder']);
    }

    /**
     * Test user registration and login.
     */
    public function test_user_can_register_and_login(): void
    {
        // 1. Test Register
        $registerResponse = $this->postJson('/api/register', [
            'nama_lengkap' => 'Jane Doe',
            'email' => 'jane@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'no_hp' => '08999999999',
            'alamat' => 'Yogyakarta',
        ]);

        $registerResponse->assertStatus(201);
        $registerResponse->assertJsonPath('status', 'success');
        $registerResponse->assertJsonStructure([
            'status',
            'message',
            'data' => [
                'token',
                'user' => [
                    'id',
                    'nama_lengkap',
                    'email',
                ]
            ]
        ]);

        // 2. Test Login
        $loginResponse = $this->postJson('/api/login', [
            'email' => 'jane@example.com',
            'password' => 'password123',
        ]);

        $loginResponse->assertStatus(200);
        $loginResponse->assertJsonPath('status', 'success');
        $this->assertNotEmpty($loginResponse['data']['token']);
    }

    /**
     * Test Peternakan CRUD APIs.
     */
    public function test_peternakan_crud_endpoints(): void
    {
        // Get seeded farmer
        $farmer = User::where('email', 'farmer@smartfarm.com')->first();
        $this->assertNotNull($farmer);

        // Access unauthorized without token
        $response = $this->getJson('/api/peternakan');
        $response->assertStatus(401);

        // Store farm
        $storeResponse = $this->actingAs($farmer, 'sanctum')->postJson('/api/peternakan', [
            'nama_peternakan' => 'Peternakan Uji Coba',
            'alamat' => 'Sleman',
            'kota' => 'Sleman',
            'provinsi' => 'Yogyakarta',
            'luas_lahan' => 100.50,
        ]);

        $storeResponse->assertStatus(201);
        $storeResponse->assertJsonPath('data.nama_peternakan', 'Peternakan Uji Coba');

        $farmId = $storeResponse['data']['id_peternakan'];

        // List farms
        $listResponse = $this->actingAs($farmer, 'sanctum')->getJson('/api/peternakan');
        $listResponse->assertStatus(200);
        $listResponse->assertJsonCount(1, 'data'); // 1 farm created in this test

        // Show farm
        $showResponse = $this->actingAs($farmer, 'sanctum')->getJson("/api/peternakan/{$farmId}");
        $showResponse->assertStatus(200);
        $showResponse->assertJsonPath('data.id_peternakan', $farmId);

        // Update farm
        $updateResponse = $this->actingAs($farmer, 'sanctum')->putJson("/api/peternakan/{$farmId}", [
            'nama_peternakan' => 'Peternakan Uji Coba Baru',
            'alamat' => 'Sleman',
            'kota' => 'Sleman',
            'provinsi' => 'Yogyakarta',
            'luas_lahan' => 200.00,
        ]);
        $updateResponse->assertStatus(200);
        $updateResponse->assertJsonPath('data.nama_peternakan', 'Peternakan Uji Coba Baru');

        // Delete farm
        $deleteResponse = $this->actingAs($farmer, 'sanctum')->deleteJson("/api/peternakan/{$farmId}");
        $deleteResponse->assertStatus(200);
    }

    /**
     * Test Ternak CRUD and Dashboard metrics synchronization.
     */
    public function test_ternak_crud_recalculates_dashboard(): void
    {
        $farmer = User::where('email', 'farmer@smartfarm.com')->first();

        // 1. Create farm
        $farm = Peternakan::create([
            'id_pengguna' => $farmer->id_pengguna,
            'nama_peternakan' => 'Farming Lab',
            'alamat' => 'Yogyakarta',
            'kota' => 'Yogyakarta',
            'provinsi' => 'DIY',
            'luas_lahan' => 500,
        ]);

        // 2. Create animal type
        $jenis = JenisTernak::create([
            'nama_jenis' => 'Sapi Angus',
            'deskripsi' => 'Daging tebal hitam',
        ]);

        // 3. Store Ternak
        $storeResponse = $this->actingAs($farmer, 'sanctum')->postJson('/api/ternak', [
            'id_peternakan' => $farm->id_peternakan,
            'id_jenis' => $jenis->id_jenis,
            'kode_ternak' => 'SA-001',
            'nama_ternak' => 'Blacky',
            'jenis_kelamin' => 'Jantan',
            'umur' => 12,
            'berat' => 320.50,
            'status_kesehatan' => 'Sehat',
            'tanggal_masuk' => '2025-05-01',
        ]);

        $storeResponse->assertStatus(201);

        $ternakId = $storeResponse['data']['id_ternak'];

        // 4. Verify Dashboard table stats are automatically created/recalculated
        $this->assertDatabaseHas('dashboard', [
            'id_peternakan' => $farm->id_peternakan,
            'total_ternak' => 1,
            'ternak_sehat' => 1,
            'ternak_sakit' => 0,
        ]);

        // 5. Query Dashboard API
        $dashResponse = $this->actingAs($farmer, 'sanctum')->getJson('/api/dashboard/stats');
        $dashResponse->assertStatus(200);
        $dashResponse->assertJsonPath('data.stats.total_ternak', 1);
        $dashResponse->assertJsonPath('data.stats.ternak_sehat', 1);

        // 6. Delete Ternak
        $deleteResponse = $this->actingAs($farmer, 'sanctum')->deleteJson("/api/ternak/{$ternakId}");
        $deleteResponse->assertStatus(200);

        // 7. Verify Dashboard updated on delete
        $this->assertDatabaseHas('dashboard', [
            'id_peternakan' => $farm->id_peternakan,
            'total_ternak' => 0,
            'ternak_sehat' => 0,
            'ternak_sakit' => 0,
        ]);
    }
}
