<?php

namespace App\Services\Ari\Handlers;

use App\Console\Commands\AriListener;
use App\Services\Ari\AriClient;

class ChannelEnteredBridgeHandler implements AriEventHandlerInterface
{
    public function handle(array $event, AriListener $command, AriClient $ariClient): void
    {
        $bridgeId = $event['bridge']['id'];
        $channelId = $event['channel']['id'];
        $command->info("➡️  Entered Bridge: $channelId -> $bridgeId");
    }
}
