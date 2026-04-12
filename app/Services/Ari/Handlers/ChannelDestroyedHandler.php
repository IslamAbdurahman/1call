<?php

namespace App\Services\Ari\Handlers;

use App\Console\Commands\AriListener;
use App\Services\Ari\AriClient;

class ChannelDestroyedHandler implements AriEventHandlerInterface
{
    public function handle(array $event, AriListener $command, AriClient $ariClient): void
    {
        $channelId = $event['channel']['id'];
        $command->line("💀 Destroyed: $channelId");
    }
}
