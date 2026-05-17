<?php

namespace App\Services\Asterisk;

use App\Models\PsAor;
use App\Models\PsAuth;
use App\Models\PsEndpoint;
use App\Models\PsRegistration;
use App\Models\PsEndpointIdIp;
use App\Models\Trunk;
use Illuminate\Support\Facades\DB;

class PjsipTrunkSyncService
{
    /**
     * Sync a Trunk model to Asterisk PJSIP Realtime tables.
     */
    public function sync(Trunk $trunk): void
    {
        if (!$trunk->is_active) {
            $this->remove($trunk);
            return;
        }

        $id = $trunk->name;
        $serverUri = "sip:{$trunk->host}:{$trunk->port}";

        DB::transaction(function () use ($id, $trunk, $serverUri) {
            if (!empty($trunk->username)) {
                // ==========================================
                // REGISTRATION-BASED TRUNK
                // ==========================================
                $clientUri = "sip:{$trunk->username}@{$trunk->host}:{$trunk->port}";

                // 1. ps_auths
                PsAuth::updateOrCreate(
                    ['id' => "auth-{$id}"],
                    [
                        'auth_type' => 'userpass',
                        'username' => $trunk->username,
                        'password' => $trunk->password,
                    ]
                );

                // 2. ps_aors
                PsAor::updateOrCreate(
                    ['id' => "aor-{$id}"],
                    [
                        'contact' => $serverUri,
                        'qualify_frequency' => 60,
                    ]
                );

                // 3. ps_registrations
                PsRegistration::updateOrCreate(
                    ['id' => "reg-{$id}"],
                    [
                        'server_uri' => $serverUri,
                        'client_uri' => $clientUri,
                        'outbound_auth' => "auth-{$id}",
                        'transport' => $trunk->transport,
                        'contact_user' => $trunk->username,
                    ]
                );

                // 4. ps_endpoints
                PsEndpoint::updateOrCreate(
                    ['id' => $id],
                    [
                        'transport' => $trunk->transport,
                        'aors' => "aor-{$id}",
                        'auth' => "auth-{$id}",
                        'context' => $trunk->context,
                        'disallow' => 'all',
                        'allow' => 'ulaw,alaw,gsm,g722',
                        'direct_media' => 'no',
                        'outbound_auth' => "auth-{$id}",
                        'from_user' => $trunk->username,
                        'from_domain' => $trunk->host,
                        'rewrite_contact' => 'yes',
                        'force_rport' => 'yes',
                        'rtp_symmetric' => 'yes',
                    ]
                );

                // Clean up IP identify if it existed
                PsEndpointIdIp::where('id', "ip-{$id}")->delete();

            } else {
                // ==========================================
                // IP-AUTHENTICATED TRUNK (No registration)
                // ==========================================

                // Clean up auth/registration if they existed
                PsAuth::where('id', "auth-{$id}")->delete();
                PsRegistration::where('id', "reg-{$id}")->delete();

                // 1. ps_aors
                PsAor::updateOrCreate(
                    ['id' => "aor-{$id}"],
                    [
                        'contact' => $serverUri,
                        'qualify_frequency' => 60,
                    ]
                );

                // 2. ps_endpoint_id_ips
                PsEndpointIdIp::updateOrCreate(
                    ['id' => "ip-{$id}"],
                    [
                        'endpoint' => $id,
                        'match' => $trunk->host,
                    ]
                );

                // 3. ps_endpoints
                PsEndpoint::updateOrCreate(
                    ['id' => $id],
                    [
                        'transport' => $trunk->transport,
                        'aors' => "aor-{$id}",
                        'auth' => null,
                        'outbound_auth' => null,
                        'context' => $trunk->context,
                        'disallow' => 'all',
                        'allow' => 'ulaw,alaw,gsm,g722',
                        'direct_media' => 'no',
                        'from_user' => null,
                        'from_domain' => null,
                        'rewrite_contact' => 'no',
                        'force_rport' => 'yes',
                        'rtp_symmetric' => 'yes',
                    ]
                );
            }
        });
    }

    /**
     * Remove Trunk from Asterisk PJSIP Realtime tables.
     */
    public function remove(Trunk $trunk): void
    {
        $id = $trunk->name;

        DB::transaction(function () use ($id) {
            PsEndpoint::where('id', $id)->delete();
            PsRegistration::where('id', "reg-{$id}")->delete();
            PsAor::where('id', "aor-{$id}")->delete();
            PsAuth::where('id', "auth-{$id}")->delete();
            PsEndpointIdIp::where('id', "ip-{$id}")->delete();
        });
    }
}
