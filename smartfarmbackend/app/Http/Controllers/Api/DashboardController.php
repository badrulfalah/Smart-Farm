<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Peternakan;
use App\Models\Dashboard;
use App\Models\Peringatan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class DashboardController extends Controller
{
    /**
     * Get system statistics and Smart Farm telemetry data.
     */
    public function getStats(Request $request)
    {
        $user = $request->user();

        // Fetch user's farms
        if ($user->hasRole(['Super Admin', 'Admin'])) {
            $farms = Peternakan::all();
        } else {
            $farms = Peternakan::where('id_pengguna', $user->id_pengguna)->get();
        }

        $farmIds = $farms->pluck('id_peternakan');

        // Recalculate dashboard for each farm to guarantee accurate statistics
        foreach ($farmIds as $farmId) {
            Dashboard::recalculate($farmId);
        }

        // Get dashboard statistics
        $dashboards = Dashboard::whereIn('id_peternakan', $farmIds)->with('peternakan')->get();

        $totalTernak = $dashboards->sum('total_ternak');
        $ternakSehat = $dashboards->sum('ternak_sehat');
        $ternakSakit = $dashboards->sum('ternak_sakit');
        $jumlahPeringatan = $dashboards->sum('jumlah_peringatan');
        $stokPakan = $dashboards->sum('stok_pakan');
        
        // Find latest update time
        $latestUpdate = $dashboards->max('terakhir_update');

        // Get recent warnings
        $recentAlerts = Peringatan::whereIn('id_ternak', function ($query) use ($farmIds) {
            $query->select('id_ternak')->from('ternak')->whereIn('id_peternakan', $farmIds);
        })
        ->with('ternak')
        ->orderBy('tanggal', 'desc')
        ->limit(5)
        ->get();

        // Telemetry data (Soil moisture & Temp trend for Recharts in the frontend dashboard)
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
                    'total_ternak' => $totalTernak,
                    'ternak_sehat' => $ternakSehat,
                    'ternak_sakit' => $ternakSakit,
                    'jumlah_peringatan' => $jumlahPeringatan,
                    'stok_pakan' => (float) $stokPakan,
                    'terakhir_update' => $latestUpdate ? $latestUpdate : null,
                ],
                'farms' => $dashboards->map(function ($db) {
                    return [
                        'id_peternakan' => $db->id_peternakan,
                        'nama_peternakan' => $db->peternakan->nama_peternakan,
                        'total_ternak' => $db->total_ternak,
                        'ternak_sehat' => $db->ternak_sehat,
                        'ternak_sakit' => $db->ternak_sakit,
                        'jumlah_peringatan' => $db->jumlah_peringatan,
                        'stok_pakan' => (float) $db->stok_pakan,
                    ];
                }),
                'recent_alerts' => $recentAlerts->map(function ($alert) {
                    return [
                        'id_peringatan' => $alert->id_peringatan,
                        'kode_ternak' => $alert->ternak->kode_ternak,
                        'nama_ternak' => $alert->ternak->nama_ternak,
                        'jenis_peringatan' => $alert->jenis_peringatan,
                        'tingkat_peringatan' => $alert->tingkat_peringatan,
                        'pesan' => $alert->pesan,
                        'status' => $alert->status,
                        'tanggal' => $alert->tanggal ? $alert->tanggal : null,
                    ];
                }),
                'telemetry' => $telemetryData,
            ]
        ]);
    }
}
