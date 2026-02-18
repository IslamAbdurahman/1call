<?php

namespace App\Services;

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
        $caller = $event['channel']['caller']['number'] ?? 'Unknown';
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

        if ($callInfo) {
            $this->hangupChannel($callInfo['inbound_channel']);
            $this->hangupChannel($callInfo['outbound_channel']);
            $this->destroyBridge($callInfo['bridge_id']);

            Cache::forget("call:{$callInfo['inbound_channel']}");
            Cache::forget("call:{$callInfo['outbound_channel']}");
            Cache::forget("bridge_info:{$callInfo['bridge_id']}");
        }
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