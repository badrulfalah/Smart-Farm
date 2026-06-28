<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['nama_jenis', 'deskripsi'])]
class JenisTernak extends Model
{
    protected $table = 'jenis_ternak';
    protected $primaryKey = 'id_jenis';
    public $timestamps = false;

    public function ternak()
    {
        return $this->hasMany(Ternak::class, 'id_jenis', 'id_jenis');
    }
}
