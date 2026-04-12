<?php

namespace App\Services\Ari\Handlers;

use App\Console\Commands\AriListener;
use App\Services\Ari\AriClient;

class RecordingFailedHandler implements AriEventHandlerInterface
{
    public function handle(array $event, AriListener $command, AriClient $ariClient): void
    {
        $command->error('❌ Recording FAILED: ' . ($event['recording']['name'] ?? ''));
    }
}
