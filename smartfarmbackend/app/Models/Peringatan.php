<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['id_ternak', 'jenis_peringatan', 'tingkat_peringatan', 'pesan', 'status'])]
class Peringatan extends Model
{
    protected $table = 'peringatan';
    protected $primaryKey = 'id_peringatan';
    const CREATED_AT = 'tanggal';
    const UPDATED_AT = null;

    public function ternak()
    {
        return $this->belongsTo(Ternak::class, 'id_ternak', 'id_ternak');
    }

    public function tindakanCepat()
    {
        return $this->hasMany(TindakanCepat::class, 'id_peringatan', 'id_peringatan');
    }
}
