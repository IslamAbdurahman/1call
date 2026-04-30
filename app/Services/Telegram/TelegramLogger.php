<?php

namespace App\Services\Telegram;

use Telegram\Bot\Api;
use Illuminate\Support\Facades\Log;

class TelegramLogger
{
    public static function log($text)
    {
        // Using the token provided by the user, or better yet, from config/env
        $token = config('services.telegram.bot_token', '7763950049:AAFyTjSgv47GC-76zSez6Q9pPzNNYPH6kqA');
        $chat_id = config('services.telegram.chat_id', '531110501');

        if (empty($token)) {
            Log::warning('Telegram Bot Token is not set.');
            return 'Token not set';
        }

        try {
            $telegram = new Api($token);

            $telegram->sendMessage([
                'chat_id' => $chat_id,
                'text' => $text,
                'parse_mode' => 'html',
            ]);

            return 1;
        } catch (\Exception $exception) {
            Log::error('Telegram API Error: ' . $exception->getMessage());
            return $exception->getMessage();
        }
    }
}
