<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PsTransportSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {


//        transport-udp,,0.0.0.0:5060,,,,,,,,,,,,udp,,,,,,no,,,,,,
//transport-tcp,,0.0.0.0:5060,,,,,,,,,,,,tcp,,,,,,no,,,,,,
//transport-wss,,0.0.0.0,,,,,,,,,,,,wss,,,,,,no,,,,,,

        $ps_transports = [
            [
                'id' => 'transport-udp',
                'bind' => '0.0.0.0:5060',
                'protocol' => 'udp',
                'allow_reload' => 'no'
            ],
            [
                'id' => 'transport-tcp',
                'bind' => '0.0.0.0:5060',
                'protocol' => 'tcp',
                'allow_reload' => 'no'
            ],

            [
                'id' => 'transport-wss',
                'bind' => '0.0.0.0',
                'protocol' => 'wss',
                'allow_reload' => 'no'
            ]
        ];

        DB::table('ps_transports')->insert($ps_transports);

    }
}
