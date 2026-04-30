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

        $callInfo = \Illuminate\Support\Facades\Cache::get("bridge_info:$bridgeId");
        if ($callInfo) {
            $inbound = $callInfo['inbound_channel'] ?? null;
            $outbound = $callInfo['outbound_channel'] ?? null;

            if ($inbound && $outbound) {
                $otherChannel = ($channelId === $inbound) ? $outbound : $inbound;
                $command->error("🔌 Bridge member left, hanging up peer: $otherChannel");
                $ariClient->hangupChannel($otherChannel);
            }
        }
    }
}
