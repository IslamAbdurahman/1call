<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PsTransportSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
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

        foreach ($ps_transports as $transport) {
            DB::table('ps_transports')->updateOrInsert(
                ['id' => $transport['id']],
                $transport
            );
        }
    }
}
