<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['id_ternak', 'id_pakan', 'jumlah', 'keterangan'])]
class PemberianPakan extends Model
{
    protected $table = 'pemberian_pakan';
    protected $primaryKey = 'id_pemberian';
    const CREATED_AT = 'tanggal';
    const UPDATED_AT = null;

    public function ternak()
    {
        return $this->belongsTo(Ternak::class, 'id_ternak', 'id_ternak');
    }

    public function jenisPakan()
    {
        return $this->belongsTo(JenisPakan::class, 'id_pakan', 'id_pakan');
    }
}
