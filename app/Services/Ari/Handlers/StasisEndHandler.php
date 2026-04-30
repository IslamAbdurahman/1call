<?php

namespace App\Services\Ari\Handlers;

use App\Console\Commands\AriListener;
use App\Events\CallStateChanged;
use App\Models\CallHistory;
use App\Services\Ari\AriClient;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class StasisEndHandler implements AriEventHandlerInterface
{
    public function handle(array $event, AriListener $command, AriClient $ariClient): void
    {
        $channelId = $event['channel']['id'];
        $command->error("📴 StasisEnd: $channelId");

        $callInfo = Cache::get("call:$channelId");

        if (! $callInfo) {
            $command->warn("⚠️ No call info in cache for channel: $channelId");
            // If this was an outbound channel that never fully started, 
            // we might not have 'call:id' but maybe we have it in bridge_info?
            // For now, let's just return if not found.
            return;
        }

        $inbound = $callInfo['inbound_channel'] ?? null;
        $outbound = $callInfo['outbound_channel'] ?? null;
        $bridgeId = $callInfo['bridge_id'] ?? null;

        $command->info("🏁 Ending call session. Inbound: $inbound, Outbound: $outbound, Bridge: $bridgeId");

        // Prioritize hanging up both channels immediately
        if ($bridgeId) {
            if ($inbound) {
                $ariClient->removeChannelFromBridge($bridgeId, $inbound);
            }
            if ($outbound) {
                $ariClient->removeChannelFromBridge($bridgeId, $outbound);
            }
        }

        if ($inbound) {
            $ariClient->hangupChannel($inbound);
        }
        if ($outbound) {
            $ariClient->hangupChannel($outbound);
        }
        if ($bridgeId) {
            $ariClient->destroyBridge($bridgeId);
        }

        broadcast(new CallStateChanged($inbound, 'Ended', $callInfo));

        if (empty($callInfo['recording_name'])) {
            if ($channelId === $inbound) {
                CallHistory::create([
                    'date_time' => $callInfo['start_time'] ?? now(),
                    'src' => $callInfo['caller'] ?? null,
                    'dst' => $callInfo['called'] ?? null,
                    'duration' => 0,
                    'type' => 'inbound',
                    'status' => 'no-answer',
                    'recorded_file' => null,
                    'call_id' => $inbound,
                    'module' => 'ARI',
                ]);
                Log::info('📵 No-answer CallHistory saqlandi', [
                    'src' => $callInfo['caller'] ?? '-',
                    'dst' => $callInfo['called'] ?? '-',
                ]);
            }
            Cache::forget("call:{$inbound}");
            Cache::forget("call:{$outbound}");
            Cache::forget("bridge_info:{$bridgeId}");
        } else {
            Cache::forget("call:{$inbound}");
            Cache::forget("call:{$outbound}");
            // bridge_info is forgotten in RecordingFinishedHandler if recording exists
        }
    }
}
