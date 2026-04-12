<?php

namespace App\Services\Ari\Handlers;

use App\Console\Commands\AriListener;
use App\Services\Ari\AriClient;

interface AriEventHandlerInterface
{
    public function handle(array $event, AriListener $command, AriClient $ariClient): void;
}
