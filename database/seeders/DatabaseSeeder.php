<?php

namespace Database\Seeders;

use App\Models\Group;
use App\Models\Operator;
use App\Models\SipNumber;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            PsTransportSeeder::class,
        ]);


        $group = Group::create(['name' => 'Support']);

        Operator::create([
            'name' => 'Op 101',
            'extension' => '101',
            'group_id' => $group->id,
            'password' => 1234,
        ]);
        Operator::create([
            'name' => 'Op 102',
            'extension' => '102',
            'group_id' => $group->id,
            'password' => 1234,
        ]);

        SipNumber::create(['number' => '1000', 'group_id' => $group->id]);

        \App\Models\User::factory()->create([
            'name' => 'Admin User',
            'email' => 'admin@onecall.com',
            'password' => bcrypt('password'),
        ]);


    }
}
