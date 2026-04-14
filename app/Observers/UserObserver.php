<?php

namespace App\Observers;

use App\Models\PsAor;
use App\Models\PsAuth;
use App\Models\PsEndpoint;
use App\Models\PsExtension;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class UserObserver
{
    private const CONTEXT = 'from-internal';

    private const TRANSPORT = 'transport-tcp';

    private const ALLOW = 'ulaw,alaw';

    private const APP = 'Stasis';

    private const APP_DATA = '1call';

    /**
     * Handle the User "created" event.
     */
    public function created(User $user): void
    {
        // Spatie roli bo'lsa yoki extension mavjud bo'lsa
        if ($user->hasRole('operator') || $user->extension) {
            $this->syncAsteriskObjects($user);
        }
    }

    /**
     * Handle the User "updated" event.
     */
    public function updated(User $user): void
    {
        // Agar extension o'zgarsa, eskisini o'chirib, yangisini yaratamiz
        if ($user->isDirty('extension') && $user->getOriginal('extension')) {
            $this->deleteAsteriskObjects($user->getOriginal('extension'));
        }

        // Faqat operatorlar uchun sinxronizatsiya qilamiz
        if ($user->hasRole('operator') || $user->extension) {
            $this->syncAsteriskObjects($user);
        } else {
            // Agar roli o'zgargan bo'lsa (operatorlikdan chiqarilgan bo'lsa)
            $this->deleteAsteriskObjects($user->extension);
        }
    }

    /**
     * Handle the User "deleted" event.
     */
    public function deleted(User $user): void
    {
        if ($user->extension) {
            $this->deleteAsteriskObjects($user->extension);
        }
    }

    /**
     * Asterisk obyektlarini yaratish va yangilash (Sinxronizatsiya)
     */
    private function syncAsteriskObjects(User $user): void
    {
        $appData = config('services.ari.app', '1call');
        Log::info("Attempting Asterisk sync for User: {$user->id}, extension: {$user->extension}, app: {$appData}");

        if (! $user->extension) {
            Log::warning("Sync skipped: No extension for User {$user->id}");
            return;
        }

        try {
            DB::transaction(function () use ($user, $appData) {
                $ext = $user->extension;
                Log::info("Syncing Asterisk objects for extension: {$ext}");

                // ... (AOR and Auth parts remain same) ...
                // 1. AOR (Address of Record)
                PsAor::updateOrCreate(['id' => $ext], [
                    'max_contacts' => 1,
                    'remove_existing' => 'yes',
                    'qualify_frequency' => 60,
                ]);

                // 2. Auth (Authentication)
                $sipPassword = $user->sip_password ?? '1234';
                PsAuth::updateOrCreate(['id' => $ext], [
                    'auth_type' => 'userpass',
                    'username' => $ext,
                    'password' => $sipPassword,
                    'md5_cred' => md5("{$ext}:asterisk:{$sipPassword}"),
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
                PsExtension::updateOrCreate(
                    ['context' => self::CONTEXT, 'exten' => $ext],
                    [
                        'priority' => 1,
                        'app' => self::APP,
                        'appdata' => $appData, // Dinamik nom
                    ]
                );
                
                Log::info("Successfully synced Asterisk objects for extension: {$ext}");
            });
        } catch (\Exception $e) {
            Log::error("Asterisk sync failed for {$user->extension}: ".$e->getMessage());
        }
    }

    /**
     * Asterisk obyektlarini o'chirish
     */
    private function deleteAsteriskObjects(?string $extension): void
    {
        if (! $extension) {
            return;
        }

        PsEndpoint::where('id', $extension)->delete();
        PsAuth::where('id', $extension)->delete();
        PsAor::where('id', $extension)->delete();
        PsExtension::where('exten', $extension)->delete();
    }
}
