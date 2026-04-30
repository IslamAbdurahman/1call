<?php

namespace App\Services\Ari\Handlers;

use App\Console\Commands\AriListener;
use App\Models\CallHistory;
use App\Services\Ari\AriClient;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class RecordingFinishedHandler implements AriEventHandlerInterface
{
    public function handle(array $event, AriListener $command, AriClient $ariClient): void
    {
        $recName = $event['recording']['name'] ?? 'unknown';
        $command->info("✅ Recording finished: $recName");

        $recording = $event['recording'] ?? [];
        $recordingName = $recording['name'] ?? null;
        $duration = (int) ($recording['duration'] ?? 0);
        $format = $recording['format'] ?? 'wav';

        $asteriskRecDir = '/var/spool/asterisk/recording';
        $recordedFile = $recordingName ? "{$asteriskRecDir}/{$recordingName}.{$format}" : null;

        $bridgeId = null;
        $src = null;
        $dst = null;
        $startTime = null;
        $callId = null;
        $type = 'inbound';

        if ($recordingName && preg_match('/^rec_([^_]+(?:_[^_]+)*)_(\d+)$/', $recordingName, $m)) {
            $bridgeId = $m[1];
        }

        if ($bridgeId) {
            $callInfo = Cache::get("bridge_info:{$bridgeId}");
            if ($callInfo) {
                $src = $callInfo['caller'] ?? null;
                $dst = $callInfo['called'] ?? null;
                $startTime = $callInfo['start_time'] ?? null;
                $callId = $callInfo['inbound_channel'] ?? null;
            }
        }

        $status = $duration > 0 ? 'answered' : 'no-answer';

        $history = CallHistory::create([
            'date_time' => $startTime ?? now(),
            'src' => $src,
            'dst' => $dst,
            'duration' => $duration,
            'type' => $type,
            'status' => $status,
            'recorded_file' => $recordedFile,
            'linked_id' => $recordingName,
            'call_id' => $callId,
            'module' => 'ARI',
        ]);

        Log::info("💾 CallHistory saqlandi: #{$history->id}", [
            'src' => $src,
            'dst' => $dst,
            'duration' => $duration,
            'file' => $recordedFile,
        ]);
    }
}
