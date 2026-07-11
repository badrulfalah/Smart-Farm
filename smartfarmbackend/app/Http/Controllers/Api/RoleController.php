<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Traits\LogsActivity;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Spatie\Permission\Models\Role;

class RoleController extends Controller
{
    use LogsActivity;

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $roles = Role::with('permissions')->get();

        $formattedRoles = $roles->map(function ($role) {
            return [
                'id' => $role->id,
                'name' => $role->name,
                'permissions' => $role->permissions->pluck('name'),
                'users_count' => $role->users()->count(),
            ];
        });

        return response()->json([
            'status' => 'success',
            'data' => $formattedRoles
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        if (!Auth::user()->hasRole('Super Admin')) {
            return response()->json(['status' => 'error', 'message' => 'Akses ditolak.'], 403);
        }

        $request->validate([
            'name' => 'required|string|max:255|unique:roles,name',
            'permissions' => 'required|array',
        ]);

        $role = Role::create([
            'name' => $request->name,
            'guard_name' => 'web'
        ]);

        $role->syncPermissions($request->permissions);

        $this->logActivity('Membuat role baru: ' . $role->name, 'Role');

        return response()->json([
            'status' => 'success',
            'message' => 'Role berhasil dibuat',
            'data' => [
                'id' => $role->id,
                'name' => $role->name,
                'permissions' => $role->permissions->pluck('name'),
            ]
        ], 201);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Role $role)
    {
        if (!Auth::user()->hasRole('Super Admin')) {
            return response()->json(['status' => 'error', 'message' => 'Akses ditolak.'], 403);
        }

        if ($role->name === 'Super Admin' && $request->name !== 'Super Admin') {
            return response()->json([
                'status' => 'error',
                'message' => 'Nama role Super Admin tidak dapat diubah.'
            ], 400);
        }

        $request->validate([
            'name' => 'required|string|max:255|unique:roles,name,' . $role->id,
            'permissions' => 'required|array',
        ]);

        $role->name = $request->name;
        $role->save();

        $role->syncPermissions($request->permissions);

        $this->logActivity('Memperbarui role: ' . $role->name, 'Role');

        return response()->json([
            'status' => 'success',
            'message' => 'Role berhasil diperbarui',
            'data' => [
                'id' => $role->id,
                'name' => $role->name,
                'permissions' => $role->permissions->pluck('name'),
            ]
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, Role $role)
    {
        if (!Auth::user()->hasRole('Super Admin')) {
            return response()->json(['status' => 'error', 'message' => 'Akses ditolak.'], 403);
        }

        $protectedRoles = ['Super Admin', 'Admin', 'User'];
        if (in_array($role->name, $protectedRoles)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Role bawaan sistem (' . $role->name . ') tidak dapat dihapus.'
            ], 400);
        }

        $nama = $role->name;
        $role->delete();

        $this->logActivity('Menghapus role: ' . $nama, 'Role');

        return response()->json([
            'status' => 'success',
            'message' => 'Role berhasil dihapus'
        ]);
    }
}
