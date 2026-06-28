<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['id_peternakan', 'id_pakan', 'jumlah', 'stok_minimum'])]
class StokPakan extends Model
{
    protected $table = 'stok_pakan';
    protected $primaryKey = 'id_stok';
    const CREATED_AT = null;
    const UPDATED_AT = 'terakhir_update';

    // Since we only want to track terakhir_update, we customize timestamps
    public function setCreatedAt($value)
    {
        return $this;
    }

    public function peternakan()
    {
        return $this->belongsTo(Peternakan::class, 'id_peternakan', 'id_peternakan');
    }

    public function jenisPakan()
    {
        return $this->belongsTo(JenisPakan::class, 'id_pakan', 'id_pakan');
    }
}
