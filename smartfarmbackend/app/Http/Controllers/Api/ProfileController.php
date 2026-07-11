<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Traits\LogsActivity;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class ProfileController extends Controller
{
    use LogsActivity;

    /**
     * Update user profile.
     */
    public function update(Request $request)
    {
        $user = $request->user();

        $request->validate([
            'nama_lengkap' => 'required|string|max:255',
            'email' => [
                'required',
                'string',
                'email',
                'max:255',
                Rule::unique('pengguna', 'email')->ignore($user->id_pengguna, 'id_pengguna'),
            ],
            'no_hp' => 'nullable|string|max:20',
            'alamat' => 'nullable|string',
        ]);

        $user->nama_lengkap = $request->nama_lengkap;
        $user->email = $request->email;
        $user->no_hp = $request->no_hp;
        $user->alamat = $request->alamat;
        $user->save();

        $this->logActivity('Memperbarui profil akun', 'Profil');

        return response()->json([
            'status' => 'success',
            'message' => 'Profil berhasil diperbarui',
            'data' => $this->formatUserData($user)
        ]);
    }

    /**
     * Upload profile photo.
     */
    public function uploadPhoto(Request $request)
    {
        $request->validate([
            'photo' => 'required|image|mimes:jpeg,jpg,png|max:2048',
        ]);

        $user = $request->user();

        // Delete old photo if exists
        if ($user->foto_profil) {
            Storage::disk('public')->delete($user->foto_profil);
        }

        // Store new photo
        $path = $request->file('photo')->store('profile-photos', 'public');

        $user->foto_profil = $path;
        $user->save();

        $this->logActivity('Memperbarui foto profil', 'Profil');

        return response()->json([
            'status' => 'success',
            'message' => 'Foto profil berhasil diperbarui',
            'data' => $this->formatUserData($user)
        ]);
    }

    /**
     * Change user password.
     */
    public function changePassword(Request $request)
    {
        $request->validate([
            'current_password' => 'required|string',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $user = $request->user();

        if (!Hash::check($request->current_password, $user->password)) {
            throw ValidationException::withMessages([
                'current_password' => ['Password lama tidak sesuai.'],
            ]);
        }

        $user->password = $request->password; // Automatically hashed via model cast
        $user->save();

        $this->logActivity('Mengubah password akun', 'Profil');

        return response()->json([
            'status' => 'success',
            'message' => 'Password berhasil diubah'
        ]);
    }

    /**
     * Format user data for response.
     */
    private function formatUserData(User $user): array
    {
        return [
            'id' => $user->id_pengguna,
            'nama_lengkap' => $user->nama_lengkap,
            'name' => $user->nama_lengkap,
            'email' => $user->email,
            'no_hp' => $user->no_hp,
            'alamat' => $user->alamat,
            'foto_profil' => $user->foto_profil ? asset('storage/' . $user->foto_profil) : null,
            'roles' => $user->getRoleNames(),
            'permissions' => $user->getAllPermissions()->pluck('name'),
            'created_at' => $user->dibuat_pada ? $user->dibuat_pada->format('Y-m-d H:i:s') : null,
        ];
    }
}
