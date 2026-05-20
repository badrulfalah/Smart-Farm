<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class RolesAndPermissionsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        // Create permissions
        $permissions = [
            'view dashboard',
            'manage users',
            'manage roles',
            'manage permissions',
        ];

        foreach ($permissions as $permissionName) {
            Permission::create([
                'name' => $permissionName,
                'guard_name' => 'web'
            ]);
        }

        // Forget cached permissions after creation to ensure they are available in this process
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        // Create roles and assign created permissions
        $superAdminRole = Role::create(['name' => 'Super Admin', 'guard_name' => 'web']);
        $superAdminRole->givePermissionTo($permissions);

        $adminRole = Role::create(['name' => 'Admin', 'guard_name' => 'web']);
        $adminRole->givePermissionTo(['view dashboard', 'manage users']);

        $userRole = Role::create(['name' => 'User', 'guard_name' => 'web']);
        $userRole->givePermissionTo(['view dashboard']);

        // Create Super Admin user
        $adminUser = User::create([
            'name' => 'Super Admin',
            'email' => 'admin@smartfarm.com',
            'password' => bcrypt('password123'),
        ]);

        $adminUser->assignRole($superAdminRole);

        // Create ordinary Admin user
        $normalAdmin = User::create([
            'name' => 'SmartFarm Admin',
            'email' => 'admin2@smartfarm.com',
            'password' => bcrypt('password123'),
        ]);
        $normalAdmin->assignRole($adminRole);

        // Create ordinary User
        $normalUser = User::create([
            'name' => 'Farmer John',
            'email' => 'farmer@smartfarm.com',
            'password' => bcrypt('password123'),
        ]);
        $normalUser->assignRole($userRole);
    }
}
