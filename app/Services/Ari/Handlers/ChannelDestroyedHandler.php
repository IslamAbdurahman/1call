<?php

namespace App\Services\Ari\Handlers;

use App\Console\Commands\AriListener;
use App\Services\Ari\AriClient;
use Illuminate\Support\Facades\Cache;

class ChannelDestroyedHandler implements AriEventHandlerInterface
{
    public function handle(array $event, AriListener $command, AriClient $ariClient): void
    {
        $channelId = $event['channel']['id'];
        $command->line("💀 Channel Destroyed: $channelId");

        // Fallback hangup logic: if a channel is destroyed, make sure its partner is also hung up.
        $callInfo = Cache::get("call:$channelId");

        if ($callInfo) {
            $inboundId = $callInfo['inbound_channel'] ?? null;
            $outboundId = $callInfo['outbound_channel'] ?? null;
            $bridgeId = $callInfo['bridge_id'] ?? null;

            $otherId = ($channelId === $inboundId) ? $outboundId : $inboundId;

            if ($otherId) {
                $command->warn("🔌 Channel $channelId destroyed, ensuring partner $otherId is hung up");
                $ariClient->hangupChannel($otherId);
            }

            if ($bridgeId) {
                $ariClient->destroyBridge($bridgeId);
            }

            // Cleanup cache here too just in case StasisEnd was missed
            Cache::forget("call:$inboundId");
            Cache::forget("call:$outboundId");
            if (empty($callInfo['recording_name'])) {
                Cache::forget("bridge_info:$bridgeId");
            }
        }
    }
}
