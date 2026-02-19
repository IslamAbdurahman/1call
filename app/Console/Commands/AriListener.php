<?php

namespace App\Console\Commands;

use App\Services\CallingService;
use Illuminate\Console\Command;
use Ratchet\Client\WebSocket;
use function Ratchet\Client\connect;
use Exception;

class AriListener extends Command
{
    protected $signature = 'ari:listen';
    protected $description = 'ARI WebSocket Event Listener';

    private $callingService;
    protected string $app;
    protected string $user;
    protected string $password;
    protected string $host;

    public function __construct(CallingService $callingService)
    {
        parent::__construct();
        $this->callingService = $callingService;

        $this->app = env('ARI_APP', 'onecall');
        $this->user = env('ARI_USER', 'onecall');
        $this->password = env('ARI_PASSWORD', '11221122');
        // host for websocket should not have protocol, e.g. localhost:8088
        $this->host = env('ARI_HOST', 'localhost:8088');

        // Remove http/https if present for WS connection
        $this->host = str_replace(['http://', 'https://'], '', $this->host);
        $this->host = rtrim($this->host, '/');
    }

    public function handle()
    {
        $url = "{$this->host}/ari/events?api_key={$this->user}:{$this->password}&app={$this->app}";

        $this->info("🔌 Connecting to ARI WebSocket: ws://$url");

        connect("ws://$url")->then(function (WebSocket $conn) {

            $this->info('✅ WebSocket Connected to ARI');

            $conn->on('message', function ($data) use ($conn) {

                    $event = json_decode($data, true);

                    $type = $event['type'] ?? 'Unknown';

                    // Filter out some noisy events if needed, but for now log all major ones
                    if ($type !== 'ChannelVarset' && $type !== 'ChannelDtmfReceived') {
                        $this->line("\n" . str_repeat('=', 60));
                        $this->line("📨 EVENT: " . $type);
                    }

                    switch ($type) {

                        case 'StasisStart':
                            $this->handleStasisStart($event);
                            break;

                        case 'ChannelStateChange':
                            $state = $event['channel']['state'];
                            $channelId = $event['channel']['id'];
                            $this->line("🔄 State: $channelId -> $state");

                            if ($state === 'Up') {
                                $this->callingService->onChannelAnswered($event);
                            }
                            break;

                        case 'StasisEnd':
                            $channelId = $event['channel']['id'];
                            $this->error("📴 Call ended: $channelId");
                            $this->callingService->cleanupCall($event);
                            break;

                        case 'RecordingFinished':
                            $recName = $event['recording']['name'] ?? 'unknown';
                            $this->info("✅ Recording finished: $recName");
                            $this->callingService->saveCallHistory($event);
                            break;

                        case 'RecordingFailed':
                            $this->error("❌ Recording FAILED: " . ($event['recording']['name'] ?? ''));
                            break;

                        case 'ChannelDestroyed':
                            $channelId = $event['channel']['id'];
                            $this->line("💀 Destroyed: $channelId");
                            break;

                        case 'ChannelEnteredBridge':
                            $bridgeId = $event['bridge']['id'];
                            $channelId = $event['channel']['id'];
                            $this->info("➡️  Entered Bridge: $channelId -> $bridgeId");
                            break;

                        case 'ChannelLeftBridge':
                            $bridgeId = $event['bridge']['id'];
                            $channelId = $event['channel']['id'];
                            $this->warn("⬅️  Left Bridge: $channelId <- $bridgeId");
                            break;
                    }
                }
                );

                $conn->on('close', function ($code = null, $reason = null) {
                    $this->error("❌ Connection closed ($code): $reason");
                // Optional: Implement reconnect logic here
                }
                );

            }, function (Exception $e) {
            $this->error("❌ Could not connect: {$e->getMessage()}");
        });

        // Keep the loop running
        $this->getLoop()->run();
    }

    /**
     * Get the event loop instance (ReactPHP).
     * Laravel's command doesn't expose it directly, but Ratchet uses it.
     * Actually, connect() runs async. We need to block.
     * When using Ratchet\Client\connect within a Laravel command,
     * we usually rely on the internal loop if not specified.
     * However, explicitly running a loop might be needed if not auto-started.
     * ratchet/pawl uses React\EventLoop. The promise chain usually handles it
     * but 'connect' itself doesn't block.
     * We need a loop.
     */
    private function getLoop()
    {
        return \React\EventLoop\Loop::get();
    }

    private function handleStasisStart($event)
    {
        $channelId = $event['channel']['id'];
        $args = $event['args'] ?? [];

        if (!empty($args) && $args[0] === 'outbound') {
            $bridgeId = $args[1] ?? null;
            // OUTBOUND kanal uchun hech narsa qilmaymiz, operator go'shakni ko'tarishini kutamiz
            // Faqat keshda bridgeId borligini tekshirish kifoya
            return;
        }

        // INBOUND
        $this->callingService->handleIncomingCall($event);
    }
}