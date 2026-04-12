<?php

namespace App\Services\Ari\Handlers;

use App\Console\Commands\AriListener;
use App\Services\Ari\AriClient;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class ChannelStateChangeHandler implements AriEventHandlerInterface
{
    public function handle(array $event, AriListener $command, AriClient $ariClient): void
    {
        $state = $event['channel']['state'];
        $channelId = $event['channel']['id'];
        $command->line("🔄 State: $channelId -> $state");

        if ($state === 'Up') {
            $callInfo = Cache::get("call:$channelId");

            if (! $callInfo) {
                return;
            }

            if ($channelId === $callInfo['outbound_channel']) {
                Log::info('✅ Operator answered. Connecting bridge.');

                $ariClient->answerChannel($callInfo['inbound_channel']);

                $ariClient->addChannelToBridge($callInfo['bridge_id'], $callInfo['inbound_channel']);
                $ariClient->addChannelToBridge($callInfo['bridge_id'], $callInfo['outbound_channel']);

                $recordingName = 'rec_' . $callInfo['bridge_id'] . '_' . time();

                $callInfo['start_time'] = now()->toDateTimeString();
                $callInfo['recording_name'] = $recordingName;

                Cache::put("call:{$callInfo['inbound_channel']}", $callInfo, 1800);
                Cache::put("call:{$callInfo['outbound_channel']}", $callInfo, 1800);
                Cache::put("bridge_info:{$callInfo['bridge_id']}", $callInfo, 1800);

                $ariClient->recordBridge($callInfo['bridge_id'], $recordingName);

                broadcast(new \App\Events\CallStateChanged($callInfo['inbound_channel'], 'Answered', $callInfo));
            }
        }
    }
}
