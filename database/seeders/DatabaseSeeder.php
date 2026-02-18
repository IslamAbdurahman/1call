<?php

namespace Database\Seeders;

use App\Models\Group;
use App\Models\Operator;
use App\Models\SipNumber;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            PsTransportSeeder::class,
        ]);


        $group = Group::create(['name' => 'Support']);

        Operator::create(['name' => 'Op 101', 'extension' => '101', 'group_id' => $group->id]);
        Operator::create(['name' => 'Op 102', 'extension' => '102', 'group_id' => $group->id]);

        SipNumber::create(['number' => '1000', 'group_id' => $group->id]);

        \App\Models\User::factory()->create([
            'name' => 'Admin User',
            'email' => 'admin@onecall.com',
            'password' => bcrypt('password'),
        ]);


    }
}
