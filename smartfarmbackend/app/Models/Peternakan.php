<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['id_pengguna', 'nama_peternakan', 'alamat', 'kota', 'provinsi', 'luas_lahan'])]
class Peternakan extends Model
{
    protected $table = 'peternakan';
    protected $primaryKey = 'id_peternakan';
    const CREATED_AT = 'dibuat_pada';
    const UPDATED_AT = null;

    public function pengguna()
    {
        return $this->belongsTo(User::class, 'id_pengguna', 'id_pengguna');
    }

    public function ternak()
    {
        return $this->hasMany(Ternak::class, 'id_peternakan', 'id_peternakan');
    }

    public function stokPakan()
    {
        return $this->hasMany(StokPakan::class, 'id_peternakan', 'id_peternakan');
    }

    public function dashboard()
    {
        return $this->hasOne(Dashboard::class, 'id_peternakan', 'id_peternakan');
    }
}
