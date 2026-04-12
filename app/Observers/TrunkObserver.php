<?php

namespace App\Observers;

use App\Models\Trunk;
use App\Services\Asterisk\PjsipTrunkSyncService;

class TrunkObserver
{
    protected PjsipTrunkSyncService $syncService;

    public function __construct(PjsipTrunkSyncService $syncService)
    {
        $this->syncService = $syncService;
    }

    /**
     * Handle the Trunk "saved" event (created or updated).
     */
    public function saved(Trunk $trunk): void
    {
        $this->syncService->sync($trunk);
    }

    /**
     * Handle the Trunk "deleted" event.
     */
    public function deleted(Trunk $trunk): void
    {
        $this->syncService->remove($trunk);
    }
}
