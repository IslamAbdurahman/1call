<?php

namespace App\Services\Ari\Handlers;

use App\Console\Commands\AriListener;
use App\Events\CallStateChanged;
use App\Models\CallHistory;
use App\Services\Ari\AriClient;
use App\Services\Telegram\TelegramLogger;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class StasisEndHandler implements AriEventHandlerInterface
{
    public function handle(array $event, AriListener $command, AriClient $ariClient): void
    {
        $channelId = $event['channel']['id'];
        $command->error("📴 StasisEnd: $channelId");

        $callInfo = Cache::get("call:$channelId");

        TelegramLogger::log(
            "<b>📴 StasisEnd</b>\n" .
            "Channel: <code>{$channelId}</code>\n" .
            "CallInfo found: <b>" . ($callInfo ? 'YES' : 'NO') . "</b>"
        );

        if (! $callInfo) {
            TelegramLogger::log("<b>⚠️ StasisEnd: No callInfo found for {$channelId}, skipping.</b>");
            return;
        }

        $inboundId = $callInfo['inbound_channel'] ?? null;
        $outboundId = $callInfo['outbound_channel'] ?? null;
        $bridgeId = $callInfo['bridge_id'] ?? null;

        TelegramLogger::log(
            "<b>📋 StasisEnd CallInfo</b>\n" .
            "This channel: <code>{$channelId}</code>\n" .
            "Inbound: <code>{$inboundId}</code>\n" .
            "Outbound: <code>{$outboundId}</code>\n" .
            "Bridge: <code>{$bridgeId}</code>\n" .
            "Recording: <code>" . ($callInfo['recording_name'] ?? 'none') . "</code>"
        );

        // Broadcast "Ended" state to the frontend
        if ($inboundId) {
            broadcast(new CallStateChanged($inboundId, 'Ended', $callInfo));
        }

        // Determine the "other" channel to hang it up
        $otherChannelId = ($channelId === $inboundId) ? $outboundId : $inboundId;

        TelegramLogger::log(
            "<b>🎯 StasisEnd hangup decision</b>\n" .
            "This is: <b>" . ($channelId === $inboundId ? 'INBOUND' : 'OUTBOUND') . "</b>\n" .
            "Other channel to hangup: <code>" . ($otherChannelId ?? 'NULL') . "</code>"
        );

        if ($otherChannelId) {
            $command->warn("🔌 Hanging up other channel: $otherChannelId");
            
            if ($otherChannelId === $inboundId) {
                TelegramLogger::log("<b>🔌 StasisEnd → continuing inbound in dialplan: <code>{$inboundId}</code></b>");
                $ariClient->continueInDialplan($inboundId);
                // Fallback
                $ariClient->hangupChannel($inboundId);
            } else {
                $ariClient->hangupChannel($otherChannelId);
            }
        }

        // Destroy the bridge
        if ($bridgeId) {
            $ariClient->destroyBridge($bridgeId);
        }

        // Handle CallHistory for unanswered calls
        if (empty($callInfo['recording_name'])) {
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

        // Cleanup Cache will be handled by ChannelDestroyedHandler
    }
}
