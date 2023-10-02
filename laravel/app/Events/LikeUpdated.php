<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class LikeUpdated
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $taskId;
    public $likeCount;

    /**
     * Create a new event instance.
     */
    public function __construct($taskId, $likeCount)
    {
        $this->taskId = $taskId;
        $this->likeCount = $likeCount;
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
        return ['task.' . $this->taskId];
    }
}
