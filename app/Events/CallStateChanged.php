<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class CallStateChanged implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $state;

    public $channelId;

    public $callInfo;

    public function __construct($channelId, $state, $callInfo = [])
    {
        $this->channelId = $channelId;
        $this->state = $state;
        $this->callInfo = $callInfo;
    }

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('calls'),
        ];
    }

    public function broadcastAs(): string
    {
        return 'CallStateChanged';
    }
}
