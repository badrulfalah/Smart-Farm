<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class DashboardController extends Controller
{
    /**
     * Get system statistics and Smart Farm telemetry data.
     */
    public function getStats()
    {
        $totalUsers = User::count();
        $totalRoles = Role::count();
        $totalPermissions = Permission::count();

        // Fetch recent users
        $recentUsers = User::orderBy('created_at', 'desc')
            ->limit(5)
            ->get(['id', 'name', 'email', 'created_at']);

        $formattedRecentUsers = $recentUsers->map(function($user) {
            return [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'joined' => $user->created_at->diffForHumans()
            ];
        });

        // Mock Smart Farm Telemetry Data (Soil moisture & Temp trend for Recharts)
        $telemetryData = [
            ['time' => '00:00', 'soil_moisture' => 62, 'temperature' => 24, 'humidity' => 85],
            ['time' => '04:00', 'soil_moisture' => 65, 'temperature' => 22, 'humidity' => 90],
            ['time' => '08:00', 'soil_moisture' => 58, 'temperature' => 27, 'humidity' => 78],
            ['time' => '12:00', 'soil_moisture' => 51, 'temperature' => 31, 'humidity' => 65],
            ['time' => '16:00', 'soil_moisture' => 55, 'temperature' => 29, 'humidity' => 72],
            ['time' => '20:00', 'soil_moisture' => 60, 'temperature' => 25, 'humidity' => 82],
        ];

        return response()->json([
            'status' => 'success',
            'data' => [
                'stats' => [
                    'total_users' => $totalUsers,
                    'total_roles' => $totalRoles,
                    'total_permissions' => $totalPermissions,
                    'farm_status' => 'Optimal',
                ],
                'recent_users' => $formattedRecentUsers,
                'telemetry' => $telemetryData,
            ]
        ]);
    }
}
