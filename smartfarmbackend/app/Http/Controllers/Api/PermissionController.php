<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Spatie\Permission\Models\Permission;

class PermissionController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
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
        $request->validate([
            'name' => 'required|string|max:255|unique:permissions,name',
        ]);

        $permission = Permission::create([
            'name' => $request->name,
            'guard_name' => 'web'
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Permission berhasil dibuat',
            'data' => [
                'id' => $permission->id,
                'name' => $permission->name,
            ]
        ], 21);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Permission $permission)
    {
        // Safety: Do not allow deletion of default core permissions
        $protectedPermissions = ['view dashboard', 'manage users', 'manage roles', 'manage permissions'];
        if (in_array($permission->name, $protectedPermissions)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Permission inti sistem (' . $permission->name . ') tidak dapat dihapus.'
            ], 400);
        }

        $permission->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Permission berhasil dihapus'
        ]);
    }
}
