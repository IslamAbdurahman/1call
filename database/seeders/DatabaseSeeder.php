<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Group;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Rollarni yaratish
        $this->call(RoleSeeder::class);

        // 2. Asterisk Transport Seeder
        $this->call(PsTransportSeeder::class);

        // 3. Admin foydalanuvchisini yaratish
        $admin = User::updateOrCreate(
            ['email' => 'admin@example.com'],
            [
                'name' => 'Admin User',
                'password' => Hash::make('password'),
            ]
        );
        $admin->assignRole('admin');

        // 4. Test Guruhini yaratish
        $group = Group::updateOrCreate(['name' => 'Default Group']);

        // 5. Test Operatorini yaratish
        $operator = User::updateOrCreate(
            ['email' => '101@1call.uz'],
            [
                'name' => 'Test Operator',
                'extension' => '101',
                'password' => Hash::make('1234'),
                'group_id' => $group->id,
            ]
        );
        $operator->assignRole('operator');
    }
}
