<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use App\Models\Ternak;
use App\Models\Peringatan;
use App\Models\StokPakan;

#[Fillable(['id_peternakan', 'total_ternak', 'ternak_sehat', 'ternak_sakit', 'jumlah_peringatan', 'stok_pakan'])]
class Dashboard extends Model
{
    protected $table = 'dashboard';
    protected $primaryKey = 'id_dashboard';
    const CREATED_AT = null;
    const UPDATED_AT = 'terakhir_update';

    public static function recalculate($id_peternakan)
    {
        $totalTernak = Ternak::where('id_peternakan', $id_peternakan)->count();
        $ternakSehat = Ternak::where('id_peternakan', $id_peternakan)->where('status_kesehatan', 'Sehat')->count();
        $ternakSakit = Ternak::where('id_peternakan', $id_peternakan)->where('status_kesehatan', 'Sakit')->count();
        $jumlahPeringatan = Peringatan::whereHas('ternak', function ($query) use ($id_peternakan) {
            $query->where('id_peternakan', $id_peternakan);
        })->where('status', '!=', 'Selesai')->count();
        $stokPakan = StokPakan::where('id_peternakan', $id_peternakan)->sum('jumlah');

        return self::updateOrCreate(
            ['id_peternakan' => $id_peternakan],
            [
                'total_ternak' => $totalTernak,
                'ternak_sehat' => $ternakSehat,
                'ternak_sakit' => $ternakSakit,
                'jumlah_peringatan' => $jumlahPeringatan,
                'stok_pakan' => $stokPakan,
                'terakhir_update' => now(),
            ]
        );
    }

    public function setCreatedAt($value)
    {
        return $this;
    }

    public function peternakan()
    {
        return $this->belongsTo(Peternakan::class, 'id_peternakan', 'id_peternakan');
    }
}
