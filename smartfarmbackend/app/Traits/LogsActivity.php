<?php

namespace App\Traits;

use App\Models\RiwayatAktivitas;
use Illuminate\Support\Facades\Auth;

trait LogsActivity
{
    /**
     * Log user activity to the riwayat_aktivitas table.
     *
     * @param string $aktivitas
     * @param string $modul
     * @return void
     */
    public function logActivity(string $aktivitas, string $modul): void
    {
        if (Auth::check()) {
            RiwayatAktivitas::create([
                'id_pengguna' => Auth::id(),
                'aktivitas' => $aktivitas,
                'modul' => $modul,
            ]);
        }
    }
}
