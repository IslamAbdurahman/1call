<?php

namespace App\Events;

use App\Models\Message;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class MessageRead implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * Create a new event instance.
     */
    public function __construct(public Message $message, public $readerId)
    {
        //
    }

    /**
     * The event's broadcast name.
     */
    public function broadcastAs(): string
    {
        return 'message.read';
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, Channel>
     */
    public function broadcastOn(): array
    {
        if ($this->message->receiver_id) {
            return [
                new PrivateChannel('chat.' . $this->message->user_id),
                new PrivateChannel('chat.' . $this->message->receiver_id),
            ];
        }

        return [
            new PresenceChannel('chat'),
        ];
    }

    /**
     * The data to broadcast.
     */
    public function broadcastWith(): array
    {
        $this->message->loadMissing('reads');
        return [
            'id' => $this->message->id,
            'receiver_id' => $this->message->receiver_id,
            'reads' => $this->message->reads->map(function (mixed $user) {
                /** @var \App\Models\User & object{pivot: object{read_at: string|null}} $user */
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'read_at' => $user->pivot->read_at,
                ];
            })->toArray(),
            'reader_id' => $this->readerId,
        ];
    }
}
