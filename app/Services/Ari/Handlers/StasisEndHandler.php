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
        $command->error("📴 Call ended: $channelId");

        $callInfo = Cache::get("call:$channelId");

        if (! $callInfo) {
            return;
        }

        broadcast(new CallStateChanged($callInfo['inbound_channel'], 'Ended', $callInfo));

        $ariClient->hangupChannel($callInfo['inbound_channel']);
        $ariClient->hangupChannel($callInfo['outbound_channel']);
        $ariClient->destroyBridge($callInfo['bridge_id']);

        if (empty($callInfo['recording_name'])) {
            if ($channelId === $callInfo['inbound_channel']) {
                CallHistory::create([
                    'date_time' => $callInfo['start_time'] ?? now(),
                    'src' => $callInfo['caller'] ?? null,
                    'dst' => $callInfo['called'] ?? null,
                    'duration' => 0,
                    'type' => 'inbound',
                    'status' => 'no-answer',
                    'recorded_file' => null,
                    'call_id' => $callInfo['inbound_channel'] ?? null,
                    'module' => 'ARI',
                ]);
                Log::info('📵 No-answer CallHistory saqlandi', [
                    'src' => $callInfo['caller'] ?? '-',
                    'dst' => $callInfo['called'] ?? '-',
                ]);
            }
            Cache::forget("call:{$callInfo['inbound_channel']}");
            Cache::forget("call:{$callInfo['outbound_channel']}");
            Cache::forget("bridge_info:{$callInfo['bridge_id']}");
        } else {
            Cache::forget("call:{$callInfo['inbound_channel']}");
            Cache::forget("call:{$callInfo['outbound_channel']}");
        }
    }
}
