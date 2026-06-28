<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['nama_pakan', 'kandungan_nutrisi', 'satuan'])]
class JenisPakan extends Model
{
    protected $table = 'jenis_pakan';
    protected $primaryKey = 'id_pakan';
    public $timestamps = false;

    public function stokPakan()
    {
        return $this->hasMany(StokPakan::class, 'id_pakan', 'id_pakan');
    }

    public function pemberianPakan()
    {
        return $this->hasMany(PemberianPakan::class, 'id_pakan', 'id_pakan');
    }
}
