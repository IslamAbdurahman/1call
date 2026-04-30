<?php

namespace App\Services\Ari;

use App\Services\Telegram\TelegramLogger;
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
        $host = config('services.ari.host', 'localhost:8088');
        $this->app = config('services.ari.app', '1call');
        $this->user = config('services.ari.user', '1call');
        $this->password = config('services.ari.password', '11221122');

        // Ensure the URL has http:// prefix
        $host = rtrim($host, '/');
        if (! str_starts_with($host, 'http://') && ! str_starts_with($host, 'https://')) {
            $host = 'http://' . $host;
        }

        $this->url = $host;
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
            TelegramLogger::log("⚠️ <b>hangupChannel called with NULL channelId</b>");
            return;
        }

        $url = "{$this->url}/channels/{$channelId}";

        try {
            $response = Http::withBasicAuth($this->user, $this->password)
                ->delete($url);

            $status = $response->status();
            $body = $response->body();

            TelegramLogger::log(
                "<b>🔴 hangupChannel</b>\n" .
                "Channel: <code>{$channelId}</code>\n" .
                "URL: <code>{$url}</code>\n" .
                "HTTP Status: <b>{$status}</b>\n" .
                "Response: <pre>{$body}</pre>"
            );

            if (! $response->successful() && $status !== 404) {
                Log::error("hangupChannel failed", [
                    'channel' => $channelId,
                    'status' => $status,
                    'body' => $body,
                ]);
            }
        } catch (\Throwable $e) {
            TelegramLogger::log(
                "<b>❌ hangupChannel EXCEPTION</b>\n" .
                "Channel: <code>{$channelId}</code>\n" .
                "Error: <pre>{$e->getMessage()}</pre>"
            );
            Log::error("hangupChannel exception", [
                'channel' => $channelId,
                'error' => $e->getMessage(),
            ]);
        }
    }

    public function destroyBridge(?string $bridgeId): void
    {
        if (! $bridgeId) {
            return;
        }

        try {
            $response = Http::withBasicAuth($this->user, $this->password)
                ->delete("{$this->url}/bridges/{$bridgeId}");

            TelegramLogger::log(
                "<b>🔴 destroyBridge</b>\n" .
                "Bridge: <code>{$bridgeId}</code>\n" .
                "HTTP Status: <b>{$response->status()}</b>"
            );
        } catch (\Throwable $e) {
            Log::error("destroyBridge exception", [
                'bridge' => $bridgeId,
                'error' => $e->getMessage(),
            ]);
        }
    }
}
