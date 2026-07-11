<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Traits\LogsActivity;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    use LogsActivity;

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $users = User::with('roles')->orderBy('dibuat_pada', 'desc')->get();
        
        $formattedUsers = $users->map(function ($user) {
            return [
                'id' => $user->id_pengguna,
                'nama_lengkap' => $user->nama_lengkap,
                'name' => $user->nama_lengkap,
                'email' => $user->email,
                'no_hp' => $user->no_hp,
                'alamat' => $user->alamat,
                'peran' => $user->peran,
                'status' => $user->status,
                'roles' => $user->getRoleNames(),
                'dibuat_pada' => $user->dibuat_pada ? $user->dibuat_pada->format('Y-m-d H:i:s') : null,
                'created_at' => $user->dibuat_pada ? $user->dibuat_pada->format('Y-m-d H:i:s') : null,
            ];
        });

        return response()->json([
            'status' => 'success',
            'data' => $formattedUsers
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        if ($request->has('name')) {
            $request->merge(['nama_lengkap' => $request->name]);
        }

        $request->validate([
            'nama_lengkap' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:pengguna,email',
            'password' => 'required|string|min:8',
            'no_hp' => 'nullable|string|max:20',
            'alamat' => 'nullable|string',
            'peran' => 'nullable|string',
            'status' => 'nullable|string',
            'roles' => 'required|array',
        ]);

        $user = User::create([
            'nama_lengkap' => $request->nama_lengkap,
            'email' => $request->email,
            'password' => $request->password,
            'no_hp' => $request->no_hp,
            'alamat' => $request->alamat,
            'peran' => $request->peran ?? 'User',
            'status' => $request->status ?? 'Aktif',
        ]);

        // Sync Spatie roles
        $user->syncRoles($request->roles);

        $this->logActivity('Menambahkan pengguna baru: ' . $user->nama_lengkap, 'Pengguna');

        return response()->json([
            'status' => 'success',
            'message' => 'Pengguna berhasil ditambahkan',
            'data' => [
                'id' => $user->id_pengguna,
                'nama_lengkap' => $user->nama_lengkap,
                'name' => $user->nama_lengkap,
                'email' => $user->email,
                'roles' => $user->getRoleNames(),
            ]
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(User $user)
    {
        return response()->json([
            'status' => 'success',
            'data' => [
                'id' => $user->id_pengguna,
                'nama_lengkap' => $user->nama_lengkap,
                'name' => $user->nama_lengkap,
                'email' => $user->email,
                'no_hp' => $user->no_hp,
                'alamat' => $user->alamat,
                'peran' => $user->peran,
                'status' => $user->status,
                'roles' => $user->getRoleNames(),
                'dibuat_pada' => $user->dibuat_pada ? $user->dibuat_pada->format('Y-m-d H:i:s') : null,
                'created_at' => $user->dibuat_pada ? $user->dibuat_pada->format('Y-m-d H:i:s') : null,
            ]
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, User $user)
    {
        if ($request->has('name')) {
            $request->merge(['nama_lengkap' => $request->name]);
        }

        $request->validate([
            'nama_lengkap' => 'required|string|max:255',
            'email' => [
                'required',
                'string',
                'email',
                'max:255',
                Rule::unique('pengguna', 'email')->ignore($user->id_pengguna, 'id_pengguna'),
            ],
            'password' => 'nullable|string|min:8',
            'no_hp' => 'nullable|string|max:20',
            'alamat' => 'nullable|string',
            'peran' => 'nullable|string',
            'status' => 'nullable|string',
            'roles' => 'required|array',
        ]);

        $user->nama_lengkap = $request->nama_lengkap;
        $user->email = $request->email;
        $user->no_hp = $request->no_hp;
        $user->alamat = $request->alamat;
        $user->peran = $request->peran ?? $user->peran;
        $user->status = $request->status ?? $user->status;

        if ($request->filled('password')) {
            $user->password = $request->password;
        }

        $user->save();

        // Sync Spatie roles
        $user->syncRoles($request->roles);

        $this->logActivity('Memperbarui data pengguna: ' . $user->nama_lengkap, 'Pengguna');

        return response()->json([
            'status' => 'success',
            'message' => 'Pengguna berhasil diperbarui',
            'data' => [
                'id' => $user->id_pengguna,
                'nama_lengkap' => $user->nama_lengkap,
                'name' => $user->nama_lengkap,
                'email' => $user->email,
                'roles' => $user->getRoleNames(),
            ]
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, User $user)
    {
        // Secure: Prevent self-deletion
        if ($request->user()->id_pengguna === $user->id_pengguna) {
            return response()->json([
                'status' => 'error',
                'message' => 'Anda tidak bisa menghapus akun Anda sendiri.'
            ], 400);
        }

        // Secure: Prevent deletion of Super Admin if user is not super admin
        if ($user->hasRole('Super Admin') && !$request->user()->hasRole('Super Admin')) {
            return response()->json([
                'status' => 'error',
                'message' => 'Hanya Super Admin yang dapat menghapus akun Super Admin lainnya.'
            ], 403);
        }

        $nama = $user->nama_lengkap;
        $user->delete();

        $this->logActivity('Menghapus pengguna: ' . $nama, 'Pengguna');

        return response()->json([
            'status' => 'success',
            'message' => 'Pengguna berhasil dihapus'
        ]);
    }
}
