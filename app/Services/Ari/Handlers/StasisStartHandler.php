<?php

namespace App\Services\Ari\Handlers;

use App\Console\Commands\AriListener;
use App\Models\SipNumber;
use App\Services\Ari\AriClient;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class StasisStartHandler implements AriEventHandlerInterface
{
    public function handle(array $event, AriListener $command, AriClient $ariClient): void
    {
        $args = $event['args'] ?? [];

        if (! empty($args) && $args[0] === 'outbound') {
            $realOutboundId = $event['channel']['id'];
            $bridgeId = $args[1] ?? 'unknown';
            
            \App\Services\Telegram\TelegramLogger::log(
                "<b>📞 Outbound StasisStart</b>\n" .
                "Real Channel ID: <code>{$realOutboundId}</code>\n" .
                "Bridge ID from args: <code>{$bridgeId}</code>"
            );
            return;
        }

        $inboundChannelId = $event['channel']['id'];

        $caller = $event['channel']['caller']['number'] ?? '';
        if (empty($caller) || $caller === 'unknown' || $caller === 'anonymous') {
            $channelName = $event['channel']['name'] ?? '';
            if (preg_match('/PJSIP\/([^\-]+)/', $channelName, $m)) {
                $caller = $m[1];
            }
        }
        if (empty($caller)) {
            $caller = 'Unknown';
        }

        $called = $event['channel']['dialplan']['exten'] ?? 'Unknown';

        Log::info('📞 NEW INBOUND CALL', ['caller' => $caller, 'called' => $called, 'channel' => $inboundChannelId]);

        if ($caller === $called) {
            Log::warning("🚫 Self-call blocked: {$caller} → {$called}");
            $ariClient->hangupChannel($inboundChannelId);

            return;
        }

        $ariClient->indicateRinging($inboundChannelId);

        $bridgeId = $ariClient->createBridge();
        if (! $bridgeId) {
            $ariClient->hangupChannel($inboundChannelId);

            return;
        }

        $sipNumber = SipNumber::where('number', $called)->with('group.operators')->first();
        if ($sipNumber && $sipNumber->group_id && $sipNumber->group->operators->count() > 0) {
            $availableOperators = $sipNumber->group->operators->filter(fn ($op) => $op->extension !== $caller);
            if ($availableOperators->isEmpty()) {
                Log::warning("🚫 Self-call blocked via routing: {$caller} → group has no other operators");
                $ariClient->destroyBridge($bridgeId);
                $ariClient->hangupChannel($inboundChannelId);

                return;
            }
            $operator = $availableOperators->first();
            $targetEndpoint = "PJSIP/{$operator->extension}";
        } else {
            $targetEndpoint = "PJSIP/{$called}";
        }

        $outboundChannelId = $ariClient->createOutboundChannel($targetEndpoint, $bridgeId, $caller);

        if (! $outboundChannelId) {
            $ariClient->destroyBridge($bridgeId);
            $ariClient->hangupChannel($inboundChannelId);

            return;
        }

        $callData = [
            'bridge_id' => $bridgeId,
            'inbound_channel' => $inboundChannelId,
            'outbound_channel' => $outboundChannelId,
            'caller' => $caller,
            'called' => $called,
        ];

        Cache::put("call:$inboundChannelId", $callData, 1800);
        Cache::put("call:$outboundChannelId", $callData, 1800);
        Cache::put("bridge_info:$bridgeId", $callData, 1800);

        broadcast(new \App\Events\CallStateChanged($inboundChannelId, 'Started', $callData));
    }
}
