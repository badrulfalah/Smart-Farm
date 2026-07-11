<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['id_peringatan', 'tindakan', 'penanggung_jawab', 'status', 'catatan'])]
class TindakanCepat extends Model
{
    protected $table = 'tindakan_cepat';
    protected $primaryKey = 'id_tindakan';
    const CREATED_AT = 'tanggal_tindakan';
    const UPDATED_AT = null;

    public function peringatan()
    {
        return $this->belongsTo(Peringatan::class, 'id_peringatan', 'id_peringatan');
    }
}
