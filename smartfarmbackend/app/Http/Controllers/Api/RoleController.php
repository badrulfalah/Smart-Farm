<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Spatie\Permission\Models\Role;

class RoleController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        // Return roles with their assigned permissions
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
        $request->validate([
            'name' => 'required|string|max:255|unique:roles,name',
            'permissions' => 'required|array',
        ]);

        $role = Role::create([
            'name' => $request->name,
            'guard_name' => 'web'
        ]);

        // Sync permissions
        $role->syncPermissions($request->permissions);

        return response()->json([
            'status' => 'success',
            'message' => 'Role berhasil dibuat',
            'data' => [
                'id' => $role->id,
                'name' => $role->name,
                'permissions' => $role->permissions->pluck('name'),
            ]
        ], 21);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Role $role)
    {
        // Safety: Do not allow renaming of Super Admin role
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

        // Sync permissions
        $role->syncPermissions($request->permissions);

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
    public function destroy(Role $role)
    {
        // Safety: Do not allow deletion of default roles
        $protectedRoles = ['Super Admin', 'Admin', 'User'];
        if (in_array($role->name, $protectedRoles)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Role bawaan sistem (' . $role->name . ') tidak dapat dihapus.'
            ], 400);
        }

        $role->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Role berhasil dihapus'
        ]);
    }
}
