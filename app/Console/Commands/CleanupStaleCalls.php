<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Redis;

class CleanupStaleCalls extends Command
{
    protected $signature = 'ari:cleanup-stale-calls';

    protected $description = 'Clean up stale call cache if any hanging calls remain';

    public function handle()
    {
        $this->info('🧹 Cleaning up stale calls...');

        // If using Redis, we can find keys and clean them up if they are older than expected.
        // However, since we set a TTL of 1800s, they will eventually expire.
        // This is a manual/cron forced cleanup just in case.
        if (config('cache.default') === 'redis') {
            $prefix = config('database.redis.options.prefix', config('cache.prefix'));
            $keys = Redis::keys('*call:*');
            if (empty($keys)) {
                $this->info('✅ No stale calls found.');

                return;
            }

            foreach ($keys as $key) {
                // Redis keydan prefixni olib tashlash
                $pureKey = preg_replace('/^.*call:/', 'call:', $key);
                Cache::forget($pureKey);
                $this->line("🗑 Deleted $pureKey");
            }
            $this->info('✅ Stale calls cleaned.');
        } else {
            $this->warn('⚠️ Cache driver is not Redis. Using file/database cache relies on TTL expiration automatically.');
        }
    }
}
