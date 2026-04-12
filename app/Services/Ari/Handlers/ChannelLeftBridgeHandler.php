<?php

namespace App\Services\Ari\Handlers;

use App\Console\Commands\AriListener;
use App\Services\Ari\AriClient;

class ChannelLeftBridgeHandler implements AriEventHandlerInterface
{
    public function handle(array $event, AriListener $command, AriClient $ariClient): void
    {
        $bridgeId = $event['bridge']['id'];
        $channelId = $event['channel']['id'];
        $command->warn("⬅️  Left Bridge: $channelId <- $bridgeId");
    }
}
