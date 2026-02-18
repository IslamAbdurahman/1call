<?php

namespace App\Observers;

use App\Models\Operator;
use App\Models\PsAor;
use App\Models\PsAuth;
use App\Models\PsEndpoint;
use App\Models\PsExtension; // PsExtension modelini yaratishingiz kerak
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class OperatorObserver
{
    private const CONTEXT = 'from-internal';
    private const TRANSPORT = 'transport-tcp';
    private const ALLOW = 'ulaw,alaw';
    private const APP = 'Stasis';
    private const APP_DATA = 'onecall';

    public function created(Operator $operator): void
    {
        $this->syncAsteriskObjects($operator);
    }

    public function updated(Operator $operator): void
    {
        if ($operator->isDirty('extension')) {
            $this->deleteAsteriskObjects($operator->getOriginal('extension'));
        }
        $this->syncAsteriskObjects($operator);
    }

    public function deleted(Operator $operator): void
    {
        $this->deleteAsteriskObjects($operator->extension);
    }

    /**
     * Asterisk obyektlarini yaratish va yangilash (Sinxronizatsiya)
     */
    private function syncAsteriskObjects(Operator $operator): void
    {
        try {
            DB::transaction(function () use ($operator) {
                $ext = $operator->extension;

                // 1. AOR (Address of Record)
                PsAor::updateOrCreate(['id' => $ext], [
                    'max_contacts' => 1,
                    'remove_existing' => 'yes',
                    'qualify_frequency' => 60,
                ]);

                // 2. Auth (Authentication)
                PsAuth::updateOrCreate(['id' => $ext], [
                    'auth_type' => 'userpass',
                    'username' => $ext,
                    'password' => $operator->password,
                ]);

                // 3. Endpoint
                PsEndpoint::updateOrCreate(['id' => $ext], [
                    'transport' => self::TRANSPORT,
                    'aors' => $ext,
                    'auth' => $ext,
                    'context' => self::CONTEXT,
                    'disallow' => 'all',
                    'allow' => self::ALLOW,
                    'direct_media' => 'no',
                    'rtp_symmetric' => 'yes',
                    'force_rport' => 'yes',
                    'rewrite_contact' => 'yes',
                    'dtmf_mode' => 'rfc4733',
                ]);

                // 4. PsExtension (Dialplan yo'naltirish)
                // Bu qism har bir operator uchun ARI (Stasis) ga yo'naltirish qoidasini yaratadi
                PsExtension::updateOrCreate(
                    ['context' => self::CONTEXT, 'exten' => $ext],
                    [
                        'priority' => 1,
                        'app' => self::APP,
                        'appdata' => self::APP_DATA
                    ]
                );
            });
        } catch (\Exception $e) {
            Log::error("Asterisk sync failed for {$operator->extension}: " . $e->getMessage());
        }
    }

    private function deleteAsteriskObjects(string $extension): void
    {
        PsEndpoint::where('id', $extension)->delete();
        PsAuth::where('id', $extension)->delete();
        PsAor::where('id', $extension)->delete();
        PsExtension::where('exten', $extension)->delete();
    }
}
