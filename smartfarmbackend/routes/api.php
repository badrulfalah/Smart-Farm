<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\PermissionController;
use App\Http\Controllers\Api\RoleController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\PeternakanController;
use App\Http\Controllers\Api\JenisTernakController;
use App\Http\Controllers\Api\TernakController;
use App\Http\Controllers\Api\KondisiTernakController;
use App\Http\Controllers\Api\JenisPakanController;
use App\Http\Controllers\Api\StokPakanController;
use App\Http\Controllers\Api\PemberianPakanController;
use App\Http\Controllers\Api\PeringatanController;
use App\Http\Controllers\Api\TindakanCepatController;
use App\Http\Controllers\Api\RiwayatAktivitasController;
use App\Http\Controllers\Api\ProfileController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

// Public routes
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);
Route::get('/public/overview', [DashboardController::class, 'publicOverview']);

// Protected routes (Requires Sanctum Token)
Route::middleware('auth:sanctum')->group(function () {
    // Auth info & logout
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    
    // Profile self-service
    Route::put('/profile', [ProfileController::class, 'update']);
    Route::post('/profile/photo', [ProfileController::class, 'uploadPhoto']);
    Route::put('/profile/password', [ProfileController::class, 'changePassword']);

    // Dashboard Statistics
    Route::get('/dashboard/stats', [DashboardController::class, 'getStats']);

    // Users CRUD
    Route::apiResource('users', UserController::class);

    // Roles CRUD
    Route::apiResource('roles', RoleController::class);

    // Permissions CRUD
    Route::apiResource('permissions', PermissionController::class)->only(['index', 'store', 'destroy']);

    // Smart Farm CRUD routes
    Route::apiResource('peternakan', PeternakanController::class);
    Route::apiResource('jenis-ternak', JenisTernakController::class);
    Route::apiResource('ternak', TernakController::class);
    Route::apiResource('kondisi-ternak', KondisiTernakController::class);
    Route::apiResource('jenis-pakan', JenisPakanController::class);
    Route::apiResource('stok-pakan', StokPakanController::class);
    Route::apiResource('pemberian-pakan', PemberianPakanController::class);

    // Peringatan: route spesifik HARUS di atas apiResource,
    // supaya "count-baru" tidak tertangkap sebagai {peringatan} pada route show.
    Route::get('/peringatan/count-baru', [PeringatanController::class, 'countBaru']);
    Route::apiResource('peringatan', PeringatanController::class);

    Route::apiResource('tindakan-cepat', TindakanCepatController::class);

    // Read activity logs
    Route::get('/riwayat-aktivitas', [RiwayatAktivitasController::class, 'index']);
});

// Mock test endpoint from default setup (optional but retained/cleaned)
Route::get('/jembut', function () {
    return response()->json([
        'name' => 'MBUT',
        'age' => 1,
        'status' => 'Testing API ok!'
    ]);
});