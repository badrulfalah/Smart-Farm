<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;

#[Fillable(['nama_lengkap', 'email', 'password', 'no_hp', 'alamat', 'foto_profil', 'peran', 'status'])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, Notifiable, HasRoles;

    protected $table = 'pengguna';
    protected $primaryKey = 'id_pengguna';
    const CREATED_AT = 'dibuat_pada';
    const UPDATED_AT = null;

    /**
     * Get the name of the user (alias for nama_lengkap).
     */
    public function getNameAttribute()
    {
        return $this->nama_lengkap;
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'password' => 'hashed',
        ];
    }

    public function peternakan()
    {
        return $this->hasMany(Peternakan::class, 'id_pengguna', 'id_pengguna');
    }

    public function riwayatAktivitas()
    {
        return $this->hasMany(RiwayatAktivitas::class, 'id_pengguna', 'id_pengguna');
    }
}
