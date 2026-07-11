<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['id_ternak', 'suhu_tubuh', 'berat', 'nafsu_makan', 'kondisi_fisik', 'produksi', 'catatan'])]
class KondisiTernak extends Model
{
    protected $table = 'kondisi_ternak';
    protected $primaryKey = 'id_kondisi';
    const CREATED_AT = 'tanggal_pencatatan';
    const UPDATED_AT = null;

    public function ternak()
    {
        return $this->belongsTo(Ternak::class, 'id_ternak', 'id_ternak');
    }
}
