<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['id_peternakan', 'id_jenis', 'kode_ternak', 'nama_ternak', 'jenis_kelamin', 'umur', 'berat', 'status_kesehatan', 'tanggal_masuk', 'foto'])]
class Ternak extends Model
{
    protected $table = 'ternak';
    protected $primaryKey = 'id_ternak';
    public $timestamps = false;

    public function peternakan()
    {
        return $this->belongsTo(Peternakan::class, 'id_peternakan', 'id_peternakan');
    }

    public function jenisTernak()
    {
        return $this->belongsTo(JenisTernak::class, 'id_jenis', 'id_jenis');
    }

    public function kondisiTernak()
    {
        return $this->hasMany(KondisiTernak::class, 'id_ternak', 'id_ternak');
    }

    public function pemberianPakan()
    {
        return $this->hasMany(PemberianPakan::class, 'id_ternak', 'id_ternak');
    }

    public function peringatan()
    {
        return $this->hasMany(Peringatan::class, 'id_ternak', 'id_ternak');
    }
}
