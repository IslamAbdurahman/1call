<?php

namespace App\Services;

use App\Models\CallHistory;
use App\Models\Operator;
use App\Models\SipNumber;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class CallingService
{
    protected $url;
    protected $app;
    protected $user;
    protected $password;

    public function __construct()
    {
        $this->url = env('ARI_HOST', 'localhost:8088');
        $this->app = env('ARI_APP', 'onecall');
        $this->user = env('ARI_USER', 'onecall');
        $this->password = env('ARI_PASSWORD', '11221122');

        $this->url = rtrim($this->url, '/');
        if (!str_contains($this->url, '/ari')) {
            $this->url .= '/ari';
        }
    }

    /**
     * Handle INBOUND call
     */
    public function handleIncomingCall($event)
    {
        $inboundChannelId = $event['channel']['id'];

        // caller.number bo'sh bo'lsa (internal PJSIP calls), channel nomidan ajratamiz
        // Channel name format: PJSIP/101-00000001
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

        Log::info("📞 NEW INBOUND CALL", ['caller' => $caller, 'channel' => $inboundChannelId]);

        // 1. Mijozga "Ringing" (chaqiruv ketyapti) signali yuboriladi, go'shak ko'tarilmaydi!
        $this->indicateRinging($inboundChannelId);

        // 2. Bridge yaratish
        $bridgeId = $this->createBridge();
        if (!$bridgeId) {
            $this->hangupChannel($inboundChannelId);
            return;
        }

        // 3. Routing
        $sipNumber = SipNumber::where('number', $called)->with('group.operators')->first();
        if ($sipNumber && $sipNumber->group_id && $sipNumber->group->operators->count() > 0) {
            $operator = $sipNumber->group->operators->first(); // Bu yerda operatorlar bandligini tekshirish kerak
            $targetEndpoint = "PJSIP/{$operator->extension}";
        }
        else {
            $targetEndpoint = "PJSIP/{$called}";
        }

        // 4. Outbound kanal yaratish (Operatorga qo'ng'iroq)
        // Mijozning raqami operatorga ko'rinadi
        $outboundChannelId = $this->createOutboundChannel($targetEndpoint, $bridgeId, $caller);

        if (!$outboundChannelId) {
            $this->destroyBridge($bridgeId);
            $this->hangupChannel($inboundChannelId);
            return;
        }

        // 5. Keshga saqlash (Parallel qo'ng'iroqlar uchun xavfsiz)
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
    }

    /**
     * Operator go'shakni ko'targanda ishlaydi
     */
    public function onChannelAnswered($event)
    {
        $channelId = $event['channel']['id'];
        $callInfo = Cache::get("call:$channelId");

        if (!$callInfo)
            return;

        // Agar javob bergan kanal outbound bo'lsa (operator ko'tardi)
        if ($channelId === $callInfo['outbound_channel']) {
            Log::info("✅ Operator answered. Connecting bridge.");

            // 1. Mijoz kanalini (Inbound) ENDI javob berish holatiga o'tkazamiz
            $this->answerChannel($callInfo['inbound_channel']);

            // 2. Ikkala kanalni ham bridgega qo'shamiz
            $this->addChannelToBridge($callInfo['bridge_id'], $callInfo['inbound_channel']);
            $this->addChannelToBridge($callInfo['bridge_id'], $callInfo['outbound_channel']);

            // 3. Yozib olishni boshlash
            $recordingName = "rec_" . $callInfo['bridge_id'] . "_" . time();

            // Boshlanish vaqtini keshga saqlash
            $callInfo['start_time'] = now()->toDateTimeString();
            $callInfo['recording_name'] = $recordingName;
            Cache::put("call:{$callInfo['inbound_channel']}", $callInfo, 1800);
            Cache::put("call:{$callInfo['outbound_channel']}", $callInfo, 1800);
            Cache::put("bridge_info:{$callInfo['bridge_id']}", $callInfo, 1800);

            $this->recordBridge($callInfo['bridge_id'], $recordingName);
        }
    }

    private function recordBridge($bridgeId, $recordingName)
    {
        Log::info("🎙 Starting recording for bridge: $bridgeId");
        Http::withBasicAuth($this->user, $this->password)
            ->post("{$this->url}/bridges/{$bridgeId}/record", [
            'name' => $recordingName,
            'format' => 'wav',
            'ifExists' => 'overwrite',
        ]);
    }

    private function indicateRinging($channelId)
    {
        return Http::withBasicAuth($this->user, $this->password)
            ->post("{$this->url}/channels/{$channelId}/ring")
            ->successful();
    }

    private function createOutboundChannel($endpoint, $bridgeId, $callerId)
    {
        $response = Http::withBasicAuth($this->user, $this->password)
            ->post("{$this->url}/channels", [
            'endpoint' => $endpoint,
            'app' => $this->app,
            'appArgs' => "outbound,$bridgeId", // Eventga bridgeId ni jo'natish
            'callerId' => $callerId,
            'timeout' => 30,
        ]);

        return $response->successful() ? $response->json()['id'] : null;
    }

    private function answerChannel($channelId)
    {
        return Http::withBasicAuth($this->user, $this->password)
            ->post("{$this->url}/channels/{$channelId}/answer")
            ->successful();
    }

    private function createBridge()
    {
        $response = Http::withBasicAuth($this->user, $this->password)
            ->post("{$this->url}/bridges", [
            'type' => 'mixing',
            'name' => 'br-' . uniqid()
        ]);
        return $response->successful() ? $response->json()['id'] : null;
    }

    private function addChannelToBridge($bridgeId, $channelId)
    {
        Http::withBasicAuth($this->user, $this->password)
            ->post("{$this->url}/bridges/{$bridgeId}/addChannel", ['channel' => $channelId]);
    }

    public function cleanupCall($event)
    {
        $channelId = $event['channel']['id'];
        $callInfo = Cache::get("call:$channelId");

        if (!$callInfo) {
            return;
        }

        $this->hangupChannel($callInfo['inbound_channel']);
        $this->hangupChannel($callInfo['outbound_channel']);
        $this->destroyBridge($callInfo['bridge_id']);

        // Agar recording boshlanmagan bo'lsa (operator ko'tarmadi) — no-answer
        if (empty($callInfo['recording_name'])) {
            // Dublikat oldini olish: faqat inbound kanal uchun bir marta yozamiz
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
            // No-answer: keshni tozalaymiz
            Cache::forget("call:{$callInfo['inbound_channel']}");
            Cache::forget("call:{$callInfo['outbound_channel']}");
            Cache::forget("bridge_info:{$callInfo['bridge_id']}");
        }
        else {
            // Recording ketayapti: bridge_info ni SAQLAYMIZ — RecordingFinished ishlatadi
            // Faqat call:channel keshlarini o'chiramiz
            Cache::forget("call:{$callInfo['inbound_channel']}");
            Cache::forget("call:{$callInfo['outbound_channel']}");
        // bridge_info ni saveCallHistory() o'chiradi!
        }
    }

    /**
     * RecordingFinished eventida call_histories ga yozish
     */
    public function saveCallHistory($event)
    {
        $recording = $event['recording'] ?? [];
        $recordingName = $recording['name'] ?? null;
        $duration = (int)($recording['duration'] ?? 0);
        $format = $recording['format'] ?? 'wav';

        // Asterisk yozuvlarni ko'pincha /var/spool/asterisk/recording/ ga saqlaydi
        $asteriskRecDir = '/var/spool/asterisk/recording';
        $recordedFile = $recordingName ? "{$asteriskRecDir}/{$recordingName}.{$format}" : null;

        // BridgeId ni recording name dan ajratish: rec_{bridgeId}_{timestamp}
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

                // Cleanup cache
                Cache::forget("bridge_info:{$bridgeId}");
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
            'src' => $src, 'dst' => $dst, 'duration' => $duration, 'file' => $recordedFile
        ]);
    }

    private function hangupChannel($channelId)
    {
        if (!$channelId)
            return;
        Http::withBasicAuth($this->user, $this->password)->delete("{$this->url}/channels/{$channelId}");
    }

    private function destroyBridge($bridgeId)
    {
        if (!$bridgeId)
            return;
        Http::withBasicAuth($this->user, $this->password)->delete("{$this->url}/bridges/{$bridgeId}");
    }
}