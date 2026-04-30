<?php

namespace App\Jobs;

use App\Services\Telegram\TelegramLogger;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class SendTelegramLog implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected string $text;

    /**
     * Create a new job instance.
     */
    public function __construct(string $text)
    {
        $this->text = $text;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        TelegramLogger::log($this->text);
    }
}
