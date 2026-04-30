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
            return;
        }

        $inboundId = $callInfo['inbound_channel'] ?? null;
        $outboundId = $callInfo['outbound_channel'] ?? null;
        $bridgeId = $callInfo['bridge_id'] ?? null;

        // Broadcast "Ended" state to the frontend
        if ($inboundId) {
            broadcast(new CallStateChanged($inboundId, 'Ended', $callInfo));
        }

        // Determine the "other" channel to hang it up
        $otherChannelId = ($channelId === $inboundId) ? $outboundId : $inboundId;

        if ($otherChannelId) {
            $command->warn("🔌 Hanging up other channel: $otherChannelId");
            $ariClient->hangupChannel($otherChannelId);
        }

        // Destroy the bridge
        if ($bridgeId) {
            $ariClient->destroyBridge($bridgeId);
        }

        // Handle CallHistory for unanswered calls
        if (empty($callInfo['recording_name'])) {
            // Only create history once. We use the inbound channel event as the trigger,
            // or if the outbound channel hung up first.
            // To prevent double entries, we can check if it's already been handled, 
            // but since we're deleting the cache, the second StasisEnd will return early.
            
            CallHistory::create([
                'date_time' => $callInfo['start_time'] ?? now(),
                'src' => $callInfo['caller'] ?? null,
                'dst' => $callInfo['called'] ?? null,
                'duration' => 0,
                'type' => 'inbound',
                'status' => 'no-answer',
                'recorded_file' => null,
                'call_id' => $inboundId,
                'module' => 'ARI',
            ]);
            Log::info('📵 Unanswered CallHistory saved', [
                'src' => $callInfo['caller'] ?? '-',
                'dst' => $callInfo['called'] ?? '-',
            ]);
        }

        // Cleanup Cache
        if ($inboundId) Cache::forget("call:$inboundId");
        if ($outboundId) Cache::forget("call:$outboundId");
        if ($bridgeId) {
            // Only forget bridge_info if there's no recording
            // (If there's a recording, RecordingFinishedHandler will clean it up)
            if (empty($callInfo['recording_name'])) {
                Cache::forget("bridge_info:$bridgeId");
            }
        }
    }
}
