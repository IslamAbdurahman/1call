<?php

namespace App\Services\Ari\Handlers;

use App\Console\Commands\AriListener;
use App\Services\Ari\AriClient;
use App\Services\Telegram\TelegramLogger;
use Illuminate\Support\Facades\Cache;

class ChannelLeftBridgeHandler implements AriEventHandlerInterface
{
    public function handle(array $event, AriListener $command, AriClient $ariClient): void
    {
        $bridgeId = $event['bridge']['id'];
        $channelId = $event['channel']['id'];
        $command->warn("⬅️  Left Bridge: $channelId <- $bridgeId");

        $callInfo = Cache::get("bridge_info:{$bridgeId}");

        TelegramLogger::log(
            "<b>⬅️ ChannelLeftBridge</b>\n" .
            "Channel: <code>{$channelId}</code>\n" .
            "Bridge: <code>{$bridgeId}</code>\n" .
            "CallInfo found: <b>" . ($callInfo ? 'YES' : 'NO') . "</b>"
        );

        if ($callInfo) {
            $inboundId = $callInfo['inbound_channel'] ?? null;
            $outboundId = $callInfo['outbound_channel'] ?? null;

            TelegramLogger::log(
                "<b>📋 ChannelLeftBridge CallInfo</b>\n" .
                "This channel: <code>{$channelId}</code>\n" .
                "Inbound: <code>{$inboundId}</code>\n" .
                "Outbound: <code>{$outboundId}</code>\n" .
                "Is inbound? <b>" . ($channelId === $inboundId ? 'YES' : 'NO') . "</b>\n" .
                "Is outbound? <b>" . ($channelId === $outboundId ? 'YES' : 'NO') . "</b>"
            );

            if ($channelId === $inboundId && $outboundId) {
                $command->info("🔌 Inbound left, hanging up outbound: $outboundId");
                TelegramLogger::log("<b>🔌 Inbound left → hanging up outbound: <code>{$outboundId}</code></b>");
                $ariClient->hangupChannel($outboundId);
            } elseif ($channelId === $outboundId && $inboundId) {
                $command->info("🔌 Outbound left, hanging up inbound: $inboundId");
                TelegramLogger::log("<b>🔌 Outbound left → hanging up inbound: <code>{$inboundId}</code></b>");
                $ariClient->hangupChannel($inboundId);
            } else {
                TelegramLogger::log("<b>⚠️ Channel not matched! No hangup action taken.</b>");
            }
        }
    }
}
