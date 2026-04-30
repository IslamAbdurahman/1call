<?php

namespace App\Console\Commands;

use App\Services\Ari\AriClient;
use App\Services\Ari\Handlers\ChannelDestroyedHandler;
use App\Services\Ari\Handlers\ChannelEnteredBridgeHandler;
use App\Services\Ari\Handlers\ChannelLeftBridgeHandler;
use App\Services\Ari\Handlers\ChannelStateChangeHandler;
use App\Services\Ari\Handlers\RecordingFailedHandler;
use App\Services\Ari\Handlers\RecordingFinishedHandler;
use App\Services\Ari\Handlers\StasisEndHandler;
use App\Services\Ari\Handlers\StasisStartHandler;
use Exception;
use Illuminate\Console\Command;
use Ratchet\Client\WebSocket;
use React\EventLoop\Loop;

use function Ratchet\Client\connect;

class AriListener extends Command
{
    protected $signature = 'ari:listen';

    protected $description = 'ARI WebSocket Event Listener';

    private AriClient $ariClient;

    protected string $app;

    protected string $user;

    protected string $password;

    protected string $host;

    protected array $handlers = [
        'StasisStart' => StasisStartHandler::class,
        'ChannelStateChange' => ChannelStateChangeHandler::class,
        'StasisEnd' => StasisEndHandler::class,
        'RecordingFinished' => RecordingFinishedHandler::class,
        'RecordingFailed' => RecordingFailedHandler::class,
        'ChannelDestroyed' => ChannelDestroyedHandler::class,
        'ChannelEnteredBridge' => ChannelEnteredBridgeHandler::class,
        'ChannelLeftBridge' => ChannelLeftBridgeHandler::class,
    ];

    public function __construct(AriClient $ariClient)
    {
        parent::__construct();
        $this->ariClient = $ariClient;

        $this->app = config('services.ari.app', '1call');
        $this->user = config('services.ari.user', '1call');
        $this->password = config('services.ari.password', '11221122');
        // host for websocket should not have protocol, e.g. localhost:8088
        $this->host = config('services.ari.host', 'localhost:8088');

        // Remove http/https if present for WS connection
        $this->host = str_replace(['http://', 'https://'], '', $this->host);
        $this->host = rtrim($this->host, '/');
    }

    public function handle()
    {
        $this->connectToAri();

        // Keep the loop running
        $this->getLoop()->run();
    }

    private function connectToAri()
    {
        $url = "{$this->host}/ari/events?api_key={$this->user}:{$this->password}&app={$this->app}";

        $this->info("🔌 Connecting to ARI WebSocket: ws://$url");

        connect("ws://$url")->then(function (WebSocket $conn) {

            $this->info('✅ WebSocket Connected to ARI');

            $conn->on('message', function ($data) {

                $event = json_decode($data, true);

                $type = $event['type'] ?? 'Unknown';

                // Send all ARI events to Telegram
                \App\Services\Telegram\TelegramLogger::log(
                    "<b>📨 ARI EVENT: {$type}</b>\n" .
                    "<pre>" . json_encode($event, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . "</pre>"
                );

                // Filter out some noisy events if needed, but for now log all major ones
                if ($type !== 'ChannelVarset' && $type !== 'ChannelDtmfReceived') {
                    $this->line("\n" . str_repeat('=', 60));
                    $this->line('📨 EVENT: ' . $type);
                }

                if (isset($this->handlers[$type])) {
                    app($this->handlers[$type])->handle($event, $this, $this->ariClient);
                }
            });

            $conn->on('close', function ($code = null, $reason = null) {
                $this->error("❌ Connection closed ($code): $reason. Reconnecting in 3 seconds...");
                $this->getLoop()->addTimer(3, function () {
                    $this->connectToAri();
                });
            });

        }, function (\Throwable $e) {
            $this->error("❌ Could not connect: {$e->getMessage()}. Reconnecting in 3 seconds...");
            $this->getLoop()->addTimer(3, function () {
                $this->connectToAri();
            });
        });
    }

    /**
     * Get the event loop instance (ReactPHP).
     */
    private function getLoop()
    {
        return Loop::get();
    }
}
