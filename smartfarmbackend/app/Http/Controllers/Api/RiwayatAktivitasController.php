<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\RiwayatAktivitas;
use Illuminate\Http\Request;

class RiwayatAktivitasController extends Controller
{
    /**
     * Display a listing of the activity logs.
     */
    public function index(Request $request)
    {
        $user = $request->user();

        // Admin/Super Admin see all logs; Users see only their own.
        if ($user->hasRole(['Super Admin', 'Admin'])) {
            $logs = RiwayatAktivitas::with('pengguna')->orderBy('waktu', 'desc')->get();
        } else {
            $logs = RiwayatAktivitas::where('id_pengguna', $user->id_pengguna)
                ->with('pengguna')
                ->orderBy('waktu', 'desc')
                ->get();
        }

        $formattedLogs = $logs->map(function ($log) {
            return [
                'id_aktivitas' => $log->id_aktivitas,
                'id_pengguna' => $log->id_pengguna,
                'pengguna_nama' => $log->pengguna ? $log->pengguna->nama_lengkap : 'System',
                'aktivitas' => $log->aktivitas,
                'modul' => $log->modul,
                'waktu' => $log->waktu ? $log->waktu->format('Y-m-d H:i:s') : null,
            ];
        });

        return response()->json([
            'status' => 'success',
            'data' => $formattedLogs
        ]);
    }
}
