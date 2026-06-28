<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['id_pengguna', 'aktivitas', 'modul'])]
class RiwayatAktivitas extends Model
{
    protected $table = 'riwayat_aktivitas';
    protected $primaryKey = 'id_aktivitas';
    const CREATED_AT = 'waktu';
    const UPDATED_AT = null;

    public function pengguna()
    {
        return $this->belongsTo(User::class, 'id_pengguna', 'id_pengguna');
    }
}
