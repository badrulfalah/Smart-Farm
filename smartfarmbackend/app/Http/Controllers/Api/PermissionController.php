<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Traits\LogsActivity;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Spatie\Permission\Models\Permission;

class PermissionController extends Controller
{
    use LogsActivity;

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        if (!Auth::user()->hasRole('Super Admin')) {
            return response()->json(['status' => 'error', 'message' => 'Akses ditolak.'], 403);
        }

        $permissions = Permission::all();

        $formattedPermissions = $permissions->map(function ($permission) {
            return [
                'id' => $permission->id,
                'name' => $permission->name,
                'roles_count' => $permission->roles()->count(),
            ];
        });

        return response()->json([
            'status' => 'success',
            'data' => $formattedPermissions
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
            'name' => 'required|string|max:255|unique:permissions,name',
        ]);

        $permission = Permission::create([
            'name' => $request->name,
            'guard_name' => 'web'
        ]);

        $this->logActivity('Membuat permission baru: ' . $permission->name, 'Permission');

        return response()->json([
            'status' => 'success',
            'message' => 'Permission berhasil dibuat',
            'data' => [
                'id' => $permission->id,
                'name' => $permission->name,
            ]
        ], 201);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, Permission $permission)
    {
        if (!Auth::user()->hasRole('Super Admin')) {
            return response()->json(['status' => 'error', 'message' => 'Akses ditolak.'], 403);
        }

        $protectedPermissions = ['view dashboard', 'manage users', 'manage roles', 'manage permissions'];
        if (in_array($permission->name, $protectedPermissions)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Permission inti sistem (' . $permission->name . ') tidak dapat dihapus.'
            ], 400);
        }

        $nama = $permission->name;
        $permission->delete();

        $this->logActivity('Menghapus permission: ' . $nama, 'Permission');

        return response()->json([
            'status' => 'success',
            'message' => 'Permission berhasil dihapus'
        ]);
    }
}
