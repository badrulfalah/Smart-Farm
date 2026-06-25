<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\PermissionController;
use App\Http\Controllers\Api\PublicController;
use App\Http\Controllers\Api\RoleController;
use App\Http\Controllers\Api\UserController;
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
Route::get('/public/overview', [PublicController::class, 'overview']);

// Protected routes (Requires Sanctum Token)
Route::middleware('auth:sanctum')->group(function () {
    // Auth info & logout
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    // Dashboard Statistics
    Route::get('/dashboard/stats', [DashboardController::class, 'getStats']);

    // Users CRUD
    Route::apiResource('users', UserController::class)->only(['index', 'store', 'update', 'destroy']);

    // Roles CRUD
    Route::apiResource('roles', RoleController::class)->only(['index', 'store', 'update', 'destroy']);

    // Permissions CRUD
    Route::apiResource('permissions', PermissionController::class)->only(['index', 'store', 'destroy']);
});

// Mock test endpoint from default setup (optional but retained/cleaned)
Route::get('/jembut', function () {
    return response()->json([
        'name' => 'MBUT',
        'age' => 1,
        'status' => 'Testing API ok!'
    ]);
});
