<?php

namespace Database\Seeders;

use App\Models\Group;
use App\Models\User;
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
        $admin = User::query()
            ->updateOrCreate(
                ['email' => 'admin@1call.com'],
                [
                    'name' => 'Admin User',
                    'password' => Hash::make('password'),
                ]
            );
        $admin->assignRole('admin');

        // 4. Test Guruhini yaratish
        $group = Group::query()
            ->updateOrCreate(['name' => 'Default Group']);

        // 5. Test Operatorini yaratish
        $operator = User::query()
            ->updateOrCreate(
                ['extension' => '101'],
                [
                    'name' => 'Test Operator',
                    'email' => null,
                    'password' => Hash::make('1234'),
                    'group_id' => $group->id,
                ]
            );
        $operator->assignRole('operator');
    }
}
