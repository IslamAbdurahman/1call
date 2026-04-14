<?php

namespace App\Services\Ari;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class AriClient
{
    protected string $url;
    protected string $app;
    protected string $user;
    protected string $password;

    public function __construct()
    {
        $this->url = config('asterisk.ari_host', 'localhost:8088');
        $this->app = config('asterisk.ari_app', '1call');
        $this->user = config('asterisk.ari_user', '1call');
        $this->password = config('asterisk.ari_password', '11221122');

        $this->url = rtrim($this->url, '/');
        if (! str_contains($this->url, '/ari')) {
            $this->url .= '/ari';
        }
    }

    public function indicateRinging(string $channelId): bool
    {
        return Http::withBasicAuth($this->user, $this->password)
            ->post("{$this->url}/channels/{$channelId}/ring")
            ->successful();
    }

    public function createBridge(): ?string
    {
        $response = Http::withBasicAuth($this->user, $this->password)
            ->post("{$this->url}/bridges", [
                'type' => 'mixing',
                'name' => 'br-' . uniqid(),
            ]);

        return $response->successful() ? $response->json()['id'] : null;
    }

    public function createOutboundChannel(string $endpoint, string $bridgeId, string $callerId): ?string
    {
        $response = Http::withBasicAuth($this->user, $this->password)
            ->post("{$this->url}/channels", [
                'endpoint' => $endpoint,
                'app' => $this->app,
                'appArgs' => "outbound,$bridgeId",
                'callerId' => $callerId,
                'timeout' => 30,
            ]);

        return $response->successful() ? $response->json()['id'] : null;
    }

    public function answerChannel(string $channelId): bool
    {
        return Http::withBasicAuth($this->user, $this->password)
            ->post("{$this->url}/channels/{$channelId}/answer")
            ->successful();
    }

    public function addChannelToBridge(string $bridgeId, string $channelId): void
    {
        Http::withBasicAuth($this->user, $this->password)
            ->post("{$this->url}/bridges/{$bridgeId}/addChannel", ['channel' => $channelId]);
    }

    public function recordBridge(string $bridgeId, string $recordingName): void
    {
        Log::info("🎙 Starting recording for bridge: $bridgeId");
        Http::withBasicAuth($this->user, $this->password)
            ->post("{$this->url}/bridges/{$bridgeId}/record", [
                'name' => $recordingName,
                'format' => 'wav',
                'ifExists' => 'overwrite',
            ]);
    }

    public function hangupChannel(?string $channelId): void
    {
        if (! $channelId) {
            return;
        }
        Http::withBasicAuth($this->user, $this->password)
            ->delete("{$this->url}/channels/{$channelId}");
    }

    public function destroyBridge(?string $bridgeId): void
    {
        if (! $bridgeId) {
            return;
        }
        Http::withBasicAuth($this->user, $this->password)
            ->delete("{$this->url}/bridges/{$bridgeId}");
    }
}
