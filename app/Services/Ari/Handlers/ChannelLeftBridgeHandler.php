<?php

namespace App\Services\Ari\Handlers;

use App\Console\Commands\AriListener;
use App\Services\Ari\AriClient;
use Illuminate\Support\Facades\Cache;

class ChannelLeftBridgeHandler implements AriEventHandlerInterface
{
    public function handle(array $event, AriListener $command, AriClient $ariClient): void
    {
        $bridgeId = $event['bridge']['id'];
        $channelId = $event['channel']['id'];
        $command->warn("⬅️  Left Bridge: $channelId <- $bridgeId");

        // When a channel leaves the bridge, we should hang up the other channel
        // to ensure the call ends for both parties.
        $callInfo = Cache::get("bridge_info:{$bridgeId}");

        if ($callInfo) {
            $inboundId = $callInfo['inbound_channel'] ?? null;
            $outboundId = $callInfo['outbound_channel'] ?? null;

            if ($channelId === $inboundId && $outboundId) {
                $command->info("🔌 Inbound left, hanging up outbound: $outboundId");
                $ariClient->hangupChannel($outboundId);
            } elseif ($channelId === $outboundId && $inboundId) {
                $command->info("🔌 Outbound left, hanging up inbound: $inboundId");
                $ariClient->hangupChannel($inboundId);
            }

            // Optional: Destroy the bridge if it's likely empty now
            // $ariClient->destroyBridge($bridgeId);
        }
    }
}
