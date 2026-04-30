<?php

namespace App\Services\Ari\Handlers;

use App\Console\Commands\AriListener;
use App\Services\Ari\AriClient;
use Illuminate\Support\Facades\Cache;

class BridgeDestroyedHandler implements AriEventHandlerInterface
{
    public function handle(array $event, AriListener $command, AriClient $ariClient): void
    {
        $bridgeId = $event['bridge']['id'];
        $command->error("💣 Bridge Destroyed: $bridgeId");

        // Cleanup any remaining cache for this bridge
        Cache::forget("bridge_info:$bridgeId");
    }
}
