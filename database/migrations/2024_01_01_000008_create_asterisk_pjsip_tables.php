<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void
    {
        // Dropping existing tables if any, to ensure clean slate for raw SQL
        Schema::dropIfExists('ps_endpoints');
        Schema::dropIfExists('ps_auths');
        Schema::dropIfExists('ps_aors');
        Schema::dropIfExists('ps_contacts');
        Schema::dropIfExists('ps_domain_aliases');
        Schema::dropIfExists('ps_endpoint_id_ips');
        Schema::dropIfExists('ps_globals');
        Schema::dropIfExists('ps_registrations');
        Schema::dropIfExists('ps_transports');
        Schema::dropIfExists('ps_extensions');

        DB::unprepared("
            create table ps_aors
            (
                id                   varchar(255) not null
                    primary key,
                contact              varchar(255),
                default_expiration   integer,
                mailboxes            varchar(80),
                max_contacts         integer,
                minimum_expiration   integer,
                remove_existing      varchar(255)
                    constraint ps_aors_remove_existing_check
                        check ((remove_existing)::text = ANY
                               ((ARRAY ['0'::character varying, '1'::character varying, 'off'::character varying, 'on'::character varying, 'false'::character varying, 'true'::character varying, 'no'::character varying, 'yes'::character varying])::text[])),
                qualify_frequency    integer,
                authenticate_qualify varchar(255)
                    constraint ps_aors_authenticate_qualify_check
                        check ((authenticate_qualify)::text = ANY
                               ((ARRAY ['0'::character varying, '1'::character varying, 'off'::character varying, 'on'::character varying, 'false'::character varying, 'true'::character varying, 'no'::character varying, 'yes'::character varying])::text[])),
                maximum_expiration   integer,
                outbound_proxy       varchar(255),
                support_path         varchar(255)
                    constraint ps_aors_support_path_check
                        check ((support_path)::text = ANY
                               ((ARRAY ['0'::character varying, '1'::character varying, 'off'::character varying, 'on'::character varying, 'false'::character varying, 'true'::character varying, 'no'::character varying, 'yes'::character varying])::text[])),
                qualify_timeout      double precision,
                voicemail_extension  varchar(40),
                remove_unavailable   varchar(255)
                    constraint ps_aors_remove_unavailable_check
                        check ((remove_unavailable)::text = ANY
                               ((ARRAY ['0'::character varying, '1'::character varying, 'off'::character varying, 'on'::character varying, 'false'::character varying, 'true'::character varying, 'no'::character varying, 'yes'::character varying])::text[])),
                qualify_2xx_only     varchar(255)
                    constraint ps_aors_qualify_2xx_only_check
                        check ((qualify_2xx_only)::text = ANY
                               ((ARRAY ['0'::character varying, '1'::character varying, 'off'::character varying, 'on'::character varying, 'false'::character varying, 'true'::character varying, 'no'::character varying, 'yes'::character varying])::text[]))
            );

            create index ps_aors_qualify_frequency_contact_index
                on ps_aors (qualify_frequency, contact);

            create table ps_auths
            (
                id                       varchar(255) not null
                    primary key,
                auth_type                varchar(255)
                    constraint ps_auths_auth_type_check
                        check ((auth_type)::text = ANY
                               ((ARRAY ['md5'::character varying, 'userpass'::character varying, 'google_oauth'::character varying])::text[])),
                nonce_lifetime           integer,
                md5_cred                 varchar(40),
                password                 varchar(80),
                realm                    varchar(255),
                username                 varchar(255),
                refresh_token            varchar(255),
                oauth_clientid           varchar(255),
                oauth_secret             varchar(255),
                password_digest          varchar(1024),
                supported_algorithms_uas varchar(1024),
                supported_algorithms_uac varchar(1024)
            );

            create table ps_contacts
            (
                id                   varchar(255) not null
                    primary key,
                uri                  varchar(511),
                expiration_time      bigint,
                qualify_frequency    integer,
                outbound_proxy       varchar(255),
                path                 text,
                user_agent           varchar(255),
                qualify_timeout      double precision,
                reg_server           varchar(255),
                authenticate_qualify varchar(255)
                    constraint ps_contacts_authenticate_qualify_check
                        check ((authenticate_qualify)::text = ANY
                               ((ARRAY ['0'::character varying, '1'::character varying, 'off'::character varying, 'on'::character varying, 'false'::character varying, 'true'::character varying, 'no'::character varying, 'yes'::character varying])::text[])),
                via_addr             varchar(40),
                via_port             integer,
                call_id              varchar(255),
                endpoint             varchar(255),
                prune_on_boot        varchar(255)
                    constraint ps_contacts_prune_on_boot_check
                        check ((prune_on_boot)::text = ANY
                               ((ARRAY ['0'::character varying, '1'::character varying, 'off'::character varying, 'on'::character varying, 'false'::character varying, 'true'::character varying, 'no'::character varying, 'yes'::character varying])::text[])),
                qualify_2xx_only     varchar(255)
                    constraint ps_contacts_qualify_2xx_only_check
                        check ((qualify_2xx_only)::text = ANY
                               ((ARRAY ['0'::character varying, '1'::character varying, 'off'::character varying, 'on'::character varying, 'false'::character varying, 'true'::character varying, 'no'::character varying, 'yes'::character varying])::text[])),
                constraint ps_contacts_id_reg_server_unique
                    unique (id, reg_server)
            );

            create index ps_contacts_qualify_frequency_expiration_time_index
                on ps_contacts (qualify_frequency, expiration_time);

            create table ps_domain_aliases
            (
                id     varchar(255) not null
                    primary key,
                domain varchar(255)
            );

            create table ps_endpoint_id_ips
            (
                id                varchar(255) not null
                    primary key,
                endpoint          varchar(255),
                match             varchar(80),
                srv_lookups       varchar(255)
                    constraint ps_endpoint_id_ips_srv_lookups_check
                        check ((srv_lookups)::text = ANY
                               ((ARRAY ['0'::character varying, '1'::character varying, 'off'::character varying, 'on'::character varying, 'false'::character varying, 'true'::character varying, 'no'::character varying, 'yes'::character varying])::text[])),
                match_header      varchar(255),
                match_request_uri varchar(255)
            );

            create table ps_endpoints
            (
                id                                 varchar(255) not null
                    primary key,
                transport                          varchar(40),
                aors                               varchar(2048),
                auth                               varchar(255),
                context                            varchar(40),
                disallow                           varchar(200),
                allow                              varchar(200),
                direct_media                       varchar(255)
                    constraint ps_endpoints_direct_media_check
                        check ((direct_media)::text = ANY
                               ((ARRAY ['0'::character varying, '1'::character varying, 'off'::character varying, 'on'::character varying, 'false'::character varying, 'true'::character varying, 'no'::character varying, 'yes'::character varying])::text[])),
                connected_line_method              varchar(255)
                    constraint ps_endpoints_connected_line_method_check
                        check ((connected_line_method)::text = ANY
                               ((ARRAY ['invite'::character varying, 'reinvite'::character varying, 'update'::character varying])::text[])),
                direct_media_method                varchar(255)
                    constraint ps_endpoints_direct_media_method_check
                        check ((direct_media_method)::text = ANY
                               ((ARRAY ['invite'::character varying, 'reinvite'::character varying, 'update'::character varying])::text[])),
                direct_media_glare_mitigation      varchar(255)
                    constraint ps_endpoints_direct_media_glare_mitigation_check
                        check ((direct_media_glare_mitigation)::text = ANY
                               ((ARRAY ['none'::character varying, 'outgoing'::character varying, 'incoming'::character varying])::text[])),
                disable_direct_media_on_nat        varchar(255)
                    constraint ps_endpoints_disable_direct_media_on_nat_check
                        check ((disable_direct_media_on_nat)::text = ANY
                               ((ARRAY ['0'::character varying, '1'::character varying, 'off'::character varying, 'on'::character varying, 'false'::character varying, 'true'::character varying, 'no'::character varying, 'yes'::character varying])::text[])),
                dtmf_mode                          varchar(255)
                    constraint ps_endpoints_dtmf_mode_check
                        check ((dtmf_mode)::text = ANY
                               ((ARRAY ['rfc4733'::character varying, 'inband'::character varying, 'info'::character varying, 'auto'::character varying, 'auto_info'::character varying])::text[])),
                external_media_address             varchar(40),
                force_rport                        varchar(255)
                    constraint ps_endpoints_force_rport_check
                        check ((force_rport)::text = ANY
                               ((ARRAY ['0'::character varying, '1'::character varying, 'off'::character varying, 'on'::character varying, 'false'::character varying, 'true'::character varying, 'no'::character varying, 'yes'::character varying])::text[])),
                ice_support                        varchar(255)
                    constraint ps_endpoints_ice_support_check
                        check ((ice_support)::text = ANY
                               ((ARRAY ['0'::character varying, '1'::character varying, 'off'::character varying, 'on'::character varying, 'false'::character varying, 'true'::character varying, 'no'::character varying, 'yes'::character varying])::text[])),
                identify_by                        varchar(80),
                mailboxes                          varchar(40),
                moh_suggest                        varchar(40),
                outbound_auth                      varchar(255),
                outbound_proxy                     varchar(255),
                rewrite_contact                    varchar(255)
                    constraint ps_endpoints_rewrite_contact_check
                        check ((rewrite_contact)::text = ANY
                               ((ARRAY ['0'::character varying, '1'::character varying, 'off'::character varying, 'on'::character varying, 'false'::character varying, 'true'::character varying, 'no'::character varying, 'yes'::character varying])::text[])),
                rtp_ipv6                           varchar(255)
                    constraint ps_endpoints_rtp_ipv6_check
                        check ((rtp_ipv6)::text = ANY
                               ((ARRAY ['0'::character varying, '1'::character varying, 'off'::character varying, 'on'::character varying, 'false'::character varying, 'true'::character varying, 'no'::character varying, 'yes'::character varying])::text[])),
                rtp_symmetric                      varchar(255)
                    constraint ps_endpoints_rtp_symmetric_check
                        check ((rtp_symmetric)::text = ANY
                               ((ARRAY ['0'::character varying, '1'::character varying, 'off'::character varying, 'on'::character varying, 'false'::character varying, 'true'::character varying, 'no'::character varying, 'yes'::character varying])::text[])),
                send_diversion                     varchar(255)
                    constraint ps_endpoints_send_diversion_check
                        check ((send_diversion)::text = ANY
                               ((ARRAY ['0'::character varying, '1'::character varying, 'off'::character varying, 'on'::character varying, 'false'::character varying, 'true'::character varying, 'no'::character varying, 'yes'::character varying])::text[])),
                send_pai                           varchar(255)
                    constraint ps_endpoints_send_pai_check
                        check ((send_pai)::text = ANY
                               ((ARRAY ['0'::character varying, '1'::character varying, 'off'::character varying, 'on'::character varying, 'false'::character varying, 'true'::character varying, 'no'::character varying, 'yes'::character varying])::text[])),
                send_rpid                          varchar(255)
                    constraint ps_endpoints_send_rpid_check
                        check ((send_rpid)::text = ANY
                               ((ARRAY ['0'::character varying, '1'::character varying, 'off'::character varying, 'on'::character varying, 'false'::character varying, 'true'::character varying, 'no'::character varying, 'yes'::character varying])::text[])),
                timers_min_se                      integer,
                timers                             varchar(255)
                    constraint ps_endpoints_timers_check
                        check ((timers)::text = ANY
                               ((ARRAY ['forced'::character varying, 'no'::character varying, 'required'::character varying, 'yes'::character varying])::text[])),
                timers_sess_expires                integer,
                callerid                           varchar(40),
                callerid_privacy                   varchar(255)
                    constraint ps_endpoints_callerid_privacy_check
                        check ((callerid_privacy)::text = ANY
                               ((ARRAY ['allowed_not_screened'::character varying, 'allowed_passed_screened'::character varying, 'allowed_failed_screened'::character varying, 'allowed'::character varying, 'prohib_not_screened'::character varying, 'prohib_passed_screened'::character varying, 'prohib_failed_screened'::character varying, 'prohib'::character varying, 'unavailable'::character varying])::text[])),
                callerid_tag                       varchar(40),
                \"100rel\"                           varchar(255)
                    constraint ps_endpoints_100rel_check
                        check ((\"100rel\")::text = ANY
                               ((ARRAY ['no'::character varying, 'required'::character varying, 'peer_supported'::character varying, 'yes'::character varying])::text[])),
                aggregate_mwi                      varchar(255)
                    constraint ps_endpoints_aggregate_mwi_check
                        check ((aggregate_mwi)::text = ANY
                               ((ARRAY ['0'::character varying, '1'::character varying, 'off'::character varying, 'on'::character varying, 'false'::character varying, 'true'::character varying, 'no'::character varying, 'yes'::character varying])::text[])),
                trust_id_inbound                   varchar(255)
                    constraint ps_endpoints_trust_id_inbound_check
                        check ((trust_id_inbound)::text = ANY
                               ((ARRAY ['0'::character varying, '1'::character varying, 'off'::character varying, 'on'::character varying, 'false'::character varying, 'true'::character varying, 'no'::character varying, 'yes'::character varying])::text[])),
                trust_id_outbound                  varchar(255)
                    constraint ps_endpoints_trust_id_outbound_check
                        check ((trust_id_outbound)::text = ANY
                               ((ARRAY ['0'::character varying, '1'::character varying, 'off'::character varying, 'on'::character varying, 'false'::character varying, 'true'::character varying, 'no'::character varying, 'yes'::character varying])::text[])),
                use_ptime                          varchar(255)
                    constraint ps_endpoints_use_ptime_check
                        check ((use_ptime)::text = ANY
                               ((ARRAY ['0'::character varying, '1'::character varying, 'off'::character varying, 'on'::character varying, 'false'::character varying, 'true'::character varying, 'no'::character varying, 'yes'::character varying])::text[])),
                use_avpf                           varchar(255)
                    constraint ps_endpoints_use_avpf_check
                        check ((use_avpf)::text = ANY
                               ((ARRAY ['0'::character varying, '1'::character varying, 'off'::character varying, 'on'::character varying, 'false'::character varying, 'true'::character varying, 'no'::character varying, 'yes'::character varying])::text[])),
                media_encryption                   varchar(255)
                    constraint ps_endpoints_media_encryption_check
                        check ((media_encryption)::text = ANY
                               ((ARRAY ['no'::character varying, 'sdes'::character varying, 'dtls'::character varying])::text[])),
                inband_progress                    varchar(255)
                    constraint ps_endpoints_inband_progress_check
                        check ((inband_progress)::text = ANY
                               ((ARRAY ['0'::character varying, '1'::character varying, 'off'::character varying, 'on'::character varying, 'false'::character varying, 'true'::character varying, 'no'::character varying, 'yes'::character varying])::text[])),
                call_group                         varchar(40),
                pickup_group                       varchar(40),
                named_call_group                   varchar(40),
                named_pickup_group                 varchar(40),
                device_state_busy_at               integer,
                fax_detect                         varchar(255)
                    constraint ps_endpoints_fax_detect_check
                        check ((fax_detect)::text = ANY
                               ((ARRAY ['0'::character varying, '1'::character varying, 'off'::character varying, 'on'::character varying, 'false'::character varying, 'true'::character varying, 'no'::character varying, 'yes'::character varying])::text[])),
                t38_udptl                          varchar(255)
                    constraint ps_endpoints_t38_udptl_check
                        check ((t38_udptl)::text = ANY
                               ((ARRAY ['0'::character varying, '1'::character varying, 'off'::character varying, 'on'::character varying, 'false'::character varying, 'true'::character varying, 'no'::character varying, 'yes'::character varying])::text[])),
                t38_udptl_ec                       varchar(255)
                    constraint ps_endpoints_t38_udptl_ec_check
                        check ((t38_udptl_ec)::text = ANY
                               ((ARRAY ['none'::character varying, 'fec'::character varying, 'redundancy'::character varying])::text[])),
                t38_udptl_maxdatagram              integer,
                t38_udptl_nat                      varchar(255)
                    constraint ps_endpoints_t38_udptl_nat_check
                        check ((t38_udptl_nat)::text = ANY
                               ((ARRAY ['0'::character varying, '1'::character varying, 'off'::character varying, 'on'::character varying, 'false'::character varying, 'true'::character varying, 'no'::character varying, 'yes'::character varying])::text[])),
                t38_udptl_ipv6                     varchar(255)
                    constraint ps_endpoints_t38_udptl_ipv6_check
                        check ((t38_udptl_ipv6)::text = ANY
                               ((ARRAY ['0'::character varying, '1'::character varying, 'off'::character varying, 'on'::character varying, 'false'::character varying, 'true'::character varying, 'no'::character varying, 'yes'::character varying])::text[])),
                tone_zone                          varchar(40),
                language                           varchar(40),
                one_touch_recording                varchar(255)
                    constraint ps_endpoints_one_touch_recording_check
                        check ((one_touch_recording)::text = ANY
                               ((ARRAY ['0'::character varying, '1'::character varying, 'off'::character varying, 'on'::character varying, 'false'::character varying, 'true'::character varying, 'no'::character varying, 'yes'::character varying])::text[])),
                record_on_feature                  varchar(40),
                record_off_feature                 varchar(40),
                rtp_engine                         varchar(40),
                allow_transfer                     varchar(255)
                    constraint ps_endpoints_allow_transfer_check
                        check ((allow_transfer)::text = ANY
                               ((ARRAY ['0'::character varying, '1'::character varying, 'off'::character varying, 'on'::character varying, 'false'::character varying, 'true'::character varying, 'no'::character varying, 'yes'::character varying])::text[])),
                allow_subscribe                    varchar(255)
                    constraint ps_endpoints_allow_subscribe_check
                        check ((allow_subscribe)::text = ANY
                               ((ARRAY ['0'::character varying, '1'::character varying, 'off'::character varying, 'on'::character varying, 'false'::character varying, 'true'::character varying, 'no'::character varying, 'yes'::character varying])::text[])),
                sdp_owner                          varchar(40),
                sdp_session                        varchar(40),
                tos_audio                          varchar(10),
                tos_video                          varchar(10),
                sub_min_expiry                     integer,
                from_domain                        varchar(40),
                from_user                          varchar(40),
                mwi_from_user                      varchar(40),
                dtls_verify                        varchar(40),
                dtls_rekey                         varchar(40),
                dtls_cert_file                     varchar(200),
                dtls_private_key                   varchar(200),
                dtls_cipher                        varchar(200),
                dtls_ca_file                       varchar(200),
                dtls_ca_path                       varchar(200),
                dtls_setup                         varchar(255)
                    constraint ps_endpoints_dtls_setup_check
                        check ((dtls_setup)::text = ANY
                               ((ARRAY ['active'::character varying, 'passive'::character varying, 'actpass'::character varying])::text[])),
                srtp_tag_32                        varchar(255)
                    constraint ps_endpoints_srtp_tag_32_check
                        check ((srtp_tag_32)::text = ANY
                               ((ARRAY ['0'::character varying, '1'::character varying, 'off'::character varying, 'on'::character varying, 'false'::character varying, 'true'::character varying, 'no'::character varying, 'yes'::character varying])::text[])),
                media_address                      varchar(40),
                redirect_method                    varchar(255)
                    constraint ps_endpoints_redirect_method_check
                        check ((redirect_method)::text = ANY
                               ((ARRAY ['user'::character varying, 'uri_core'::character varying, 'uri_pjsip'::character varying])::text[])),
                set_var                            text,
                cos_audio                          integer,
                cos_video                          integer,
                message_context                    varchar(40),
                force_avp                          varchar(255)
                    constraint ps_endpoints_force_avp_check
                        check ((force_avp)::text = ANY
                               ((ARRAY ['0'::character varying, '1'::character varying, 'off'::character varying, 'on'::character varying, 'false'::character varying, 'true'::character varying, 'no'::character varying, 'yes'::character varying])::text[])),
                media_use_received_transport       varchar(255)
                    constraint ps_endpoints_media_use_received_transport_check
                        check ((media_use_received_transport)::text = ANY
                               ((ARRAY ['0'::character varying, '1'::character varying, 'off'::character varying, 'on'::character varying, 'false'::character varying, 'true'::character varying, 'no'::character varying, 'yes'::character varying])::text[])),
                accountcode                        varchar(80),
                user_eq_phone                      varchar(255)
                    constraint ps_endpoints_user_eq_phone_check
                        check ((user_eq_phone)::text = ANY
                               ((ARRAY ['0'::character varying, '1'::character varying, 'off'::character varying, 'on'::character varying, 'false'::character varying, 'true'::character varying, 'no'::character varying, 'yes'::character varying])::text[])),
                moh_passthrough                    varchar(255)
                    constraint ps_endpoints_moh_passthrough_check
                        check ((moh_passthrough)::text = ANY
                               ((ARRAY ['0'::character varying, '1'::character varying, 'off'::character varying, 'on'::character varying, 'false'::character varying, 'true'::character varying, 'no'::character varying, 'yes'::character varying])::text[])),
                media_encryption_optimistic        varchar(255)
                    constraint ps_endpoints_media_encryption_optimistic_check
                        check ((media_encryption_optimistic)::text = ANY
                               ((ARRAY ['0'::character varying, '1'::character varying, 'off'::character varying, 'on'::character varying, 'false'::character varying, 'true'::character varying, 'no'::character varying, 'yes'::character varying])::text[])),
                rpid_immediate                     varchar(255)
                    constraint ps_endpoints_rpid_immediate_check
                        check ((rpid_immediate)::text = ANY
                               ((ARRAY ['0'::character varying, '1'::character varying, 'off'::character varying, 'on'::character varying, 'false'::character varying, 'true'::character varying, 'no'::character varying, 'yes'::character varying])::text[])),
                g726_non_standard                  varchar(255)
                    constraint ps_endpoints_g726_non_standard_check
                        check ((g726_non_standard)::text = ANY
                               ((ARRAY ['0'::character varying, '1'::character varying, 'off'::character varying, 'on'::character varying, 'false'::character varying, 'true'::character varying, 'no'::character varying, 'yes'::character varying])::text[])),
                rtp_keepalive                      integer,
                rtp_timeout                        integer,
                rtp_timeout_hold                   integer,
                bind_rtp_to_media_address          varchar(255)
                    constraint ps_endpoints_bind_rtp_to_media_address_check
                        check ((bind_rtp_to_media_address)::text = ANY
                               ((ARRAY ['0'::character varying, '1'::character varying, 'off'::character varying, 'on'::character varying, 'false'::character varying, 'true'::character varying, 'no'::character varying, 'yes'::character varying])::text[])),
                voicemail_extension                varchar(40),
                mwi_subscribe_replaces_unsolicited varchar(255)
                    constraint ps_endpoints_mwi_subscribe_replaces_unsolicited_check
                        check ((mwi_subscribe_replaces_unsolicited)::text = ANY
                               ((ARRAY ['0'::character varying, '1'::character varying, 'off'::character varying, 'on'::character varying, 'false'::character varying, 'true'::character varying, 'no'::character varying, 'yes'::character varying])::text[])),
                deny                               varchar(95),
                permit                             varchar(95),
                acl                                varchar(40),
                contact_deny                       varchar(95),
                contact_permit                     varchar(95),
                contact_acl                        varchar(40),
                subscribe_context                  varchar(40),
                fax_detect_timeout                 integer,
                contact_user                       varchar(80),
                preferred_codec_only               varchar(255)
                    constraint ps_endpoints_preferred_codec_only_check
                        check ((preferred_codec_only)::text = ANY
                               ((ARRAY ['0'::character varying, '1'::character varying, 'off'::character varying, 'on'::character varying, 'false'::character varying, 'true'::character varying, 'no'::character varying, 'yes'::character varying])::text[])),
                asymmetric_rtp_codec               varchar(255)
                    constraint ps_endpoints_asymmetric_rtp_codec_check
                        check ((asymmetric_rtp_codec)::text = ANY
                               ((ARRAY ['0'::character varying, '1'::character varying, 'off'::character varying, 'on'::character varying, 'false'::character varying, 'true'::character varying, 'no'::character varying, 'yes'::character varying])::text[])),
                rtcp_mux                           varchar(255)
                    constraint ps_endpoints_rtcp_mux_check
                        check ((rtcp_mux)::text = ANY
                               ((ARRAY ['0'::character varying, '1'::character varying, 'off'::character varying, 'on'::character varying, 'false'::character varying, 'true'::character varying, 'no'::character varying, 'yes'::character varying])::text[])),
                allow_overlap                      varchar(255)
                    constraint ps_endpoints_allow_overlap_check
                        check ((allow_overlap)::text = ANY
                               ((ARRAY ['0'::character varying, '1'::character varying, 'off'::character varying, 'on'::character varying, 'false'::character varying, 'true'::character varying, 'no'::character varying, 'yes'::character varying])::text[])),
                refer_blind_progress               varchar(255)
                    constraint ps_endpoints_refer_blind_progress_check
                        check ((refer_blind_progress)::text = ANY
                               ((ARRAY ['0'::character varying, '1'::character varying, 'off'::character varying, 'on'::character varying, 'false'::character varying, 'true'::character varying, 'no'::character varying, 'yes'::character varying])::text[])),
                notify_early_inuse_ringing         varchar(255)
                    constraint ps_endpoints_notify_early_inuse_ringing_check
                        check ((notify_early_inuse_ringing)::text = ANY
                               ((ARRAY ['0'::character varying, '1'::character varying, 'off'::character varying, 'on'::character varying, 'false'::character varying, 'true'::character varying, 'no'::character varying, 'yes'::character varying])::text[])),
                max_audio_streams                  integer,
                max_video_streams                  integer,
                webrtc                             varchar(255)
                    constraint ps_endpoints_webrtc_check
                        check ((webrtc)::text = ANY
                               ((ARRAY ['0'::character varying, '1'::character varying, 'off'::character varying, 'on'::character varying, 'false'::character varying, 'true'::character varying, 'no'::character varying, 'yes'::character varying])::text[])),
                dtls_fingerprint                   varchar(255)
                    constraint ps_endpoints_dtls_fingerprint_check
                        check ((dtls_fingerprint)::text = ANY
                               ((ARRAY ['SHA-1'::character varying, 'SHA-256'::character varying])::text[])),
                incoming_mwi_mailbox               varchar(40),
                bundle                             varchar(255)
                    constraint ps_endpoints_bundle_check
                        check ((bundle)::text = ANY
                               ((ARRAY ['0'::character varying, '1'::character varying, 'off'::character varying, 'on'::character varying, 'false'::character varying, 'true'::character varying, 'no'::character varying, 'yes'::character varying])::text[])),
                dtls_auto_generate_cert            varchar(255)
                    constraint ps_endpoints_dtls_auto_generate_cert_check
                        check ((dtls_auto_generate_cert)::text = ANY
                               ((ARRAY ['0'::character varying, '1'::character varying, 'off'::character varying, 'on'::character varying, 'false'::character varying, 'true'::character varying, 'no'::character varying, 'yes'::character varying])::text[])),
                follow_early_media_fork            varchar(255)
                    constraint ps_endpoints_follow_early_media_fork_check
                        check ((follow_early_media_fork)::text = ANY
                               ((ARRAY ['0'::character varying, '1'::character varying, 'off'::character varying, 'on'::character varying, 'false'::character varying, 'true'::character varying, 'no'::character varying, 'yes'::character varying])::text[])),
                accept_multiple_sdp_answers        varchar(255)
                    constraint ps_endpoints_accept_multiple_sdp_answers_check
                        check ((accept_multiple_sdp_answers)::text = ANY
                               ((ARRAY ['0'::character varying, '1'::character varying, 'off'::character varying, 'on'::character varying, 'false'::character varying, 'true'::character varying, 'no'::character varying, 'yes'::character varying])::text[])),
                suppress_q850_reason_headers       varchar(255)
                    constraint ps_endpoints_suppress_q850_reason_headers_check
                        check ((suppress_q850_reason_headers)::text = ANY
                               ((ARRAY ['0'::character varying, '1'::character varying, 'off'::character varying, 'on'::character varying, 'false'::character varying, 'true'::character varying, 'no'::character varying, 'yes'::character varying])::text[])),
                trust_connected_line               varchar(255)
                    constraint ps_endpoints_trust_connected_line_check
                        check ((trust_connected_line)::text = ANY
                               ((ARRAY ['0'::character varying, '1'::character varying, 'off'::character varying, 'on'::character varying, 'false'::character varying, 'true'::character varying, 'no'::character varying, 'yes'::character varying])::text[])),
                send_connected_line                varchar(255)
                    constraint ps_endpoints_send_connected_line_check
                        check ((send_connected_line)::text = ANY
                               ((ARRAY ['0'::character varying, '1'::character varying, 'off'::character varying, 'on'::character varying, 'false'::character varying, 'true'::character varying, 'no'::character varying, 'yes'::character varying])::text[])),
                ignore_183_without_sdp             varchar(255)
                    constraint ps_endpoints_ignore_183_without_sdp_check
                        check ((ignore_183_without_sdp)::text = ANY
                               ((ARRAY ['0'::character varying, '1'::character varying, 'off'::character varying, 'on'::character varying, 'false'::character varying, 'true'::character varying, 'no'::character varying, 'yes'::character varying])::text[])),
                codec_prefs_incoming_offer         varchar(128),
                codec_prefs_outgoing_offer         varchar(128),
                codec_prefs_incoming_answer        varchar(128),
                codec_prefs_outgoing_answer        varchar(128),
                stir_shaken                        varchar(255)
                    constraint ps_endpoints_stir_shaken_check
                        check ((stir_shaken)::text = ANY
                               ((ARRAY ['0'::character varying, '1'::character varying, 'off'::character varying, 'on'::character varying, 'false'::character varying, 'true'::character varying, 'no'::character varying, 'yes'::character varying])::text[])),
                send_history_info                  varchar(255)
                    constraint ps_endpoints_send_history_info_check
                        check ((send_history_info)::text = ANY
                               ((ARRAY ['0'::character varying, '1'::character varying, 'off'::character varying, 'on'::character varying, 'false'::character varying, 'true'::character varying, 'no'::character varying, 'yes'::character varying])::text[])),
                allow_unauthenticated_options      varchar(255)
                    constraint ps_endpoints_allow_unauthenticated_options_check
                        check ((allow_unauthenticated_options)::text = ANY
                               ((ARRAY ['0'::character varying, '1'::character varying, 'off'::character varying, 'on'::character varying, 'false'::character varying, 'true'::character varying, 'no'::character varying, 'yes'::character varying])::text[])),
                t38_bind_udptl_to_media_address    varchar(255)
                    constraint ps_endpoints_t38_bind_udptl_to_media_address_check
                        check ((t38_bind_udptl_to_media_address)::text = ANY
                               ((ARRAY ['0'::character varying, '1'::character varying, 'off'::character varying, 'on'::character varying, 'false'::character varying, 'true'::character varying, 'no'::character varying, 'yes'::character varying])::text[])),
                geoloc_incoming_call_profile       varchar(80),
                geoloc_outgoing_call_profile       varchar(80),
                incoming_call_offer_pref           varchar(255)
                    constraint ps_endpoints_incoming_call_offer_pref_check
                        check ((incoming_call_offer_pref)::text = ANY
                               ((ARRAY ['local'::character varying, 'local_first'::character varying, 'remote'::character varying, 'remote_first'::character varying])::text[])),
                outgoing_call_offer_pref           varchar(255)
                    constraint ps_endpoints_outgoing_call_offer_pref_check
                        check ((outgoing_call_offer_pref)::text = ANY
                               ((ARRAY ['local'::character varying, 'local_first'::character varying, 'remote'::character varying, 'remote_first'::character varying])::text[])),
                stir_shaken_profile                varchar(80),
                security_negotiation               varchar(255)
                    constraint ps_endpoints_security_negotiation_check
                        check ((security_negotiation)::text = ANY
                               ((ARRAY ['no'::character varying, 'mediasec'::character varying])::text[])),
                security_mechanisms                varchar(512),
                send_aoc                           varchar(255)
                    constraint ps_endpoints_send_aoc_check
                        check ((send_aoc)::text = ANY
                               ((ARRAY ['0'::character varying, '1'::character varying, 'off'::character varying, 'on'::character varying, 'false'::character varying, 'true'::character varying, 'no'::character varying, 'yes'::character varying])::text[])),
                overlap_context                    varchar(80),
                tenantid                           varchar(80),
                suppress_moh_on_sendonly           varchar(255)
                    constraint ps_endpoints_suppress_moh_on_sendonly_check
                        check ((suppress_moh_on_sendonly)::text = ANY
                               ((ARRAY ['0'::character varying, '1'::character varying, 'off'::character varying, 'on'::character varying, 'false'::character varying, 'true'::character varying, 'no'::character varying, 'yes'::character varying])::text[]))
            );

            create table ps_globals
            (
                id                                         varchar(255) not null
                    primary key,
                max_forwards                               integer,
                user_agent                                 varchar(255),
                default_outbound_endpoint                  varchar(40),
                debug                                      varchar(40),
                endpoint_identifier_order                  varchar(127),
                max_initial_qualify_time                   integer,
                default_from_user                          varchar(80),
                keep_alive_interval                        integer,
                regcontext                                 varchar(80),
                contact_expiration_check_interval          integer,
                default_voicemail_extension                varchar(40),
                disable_multi_domain                       varchar(255)
                    constraint ps_globals_disable_multi_domain_check
                        check ((disable_multi_domain)::text = ANY
                               ((ARRAY ['0'::character varying, '1'::character varying, 'off'::character varying, 'on'::character varying, 'false'::character varying, 'true'::character varying, 'no'::character varying, 'yes'::character varying])::text[])),
                unidentified_request_count                 integer,
                unidentified_request_period                integer,
                unidentified_request_prune_interval        integer,
                default_realm                              varchar(40),
                mwi_tps_queue_high                         integer,
                mwi_tps_queue_low                          integer,
                mwi_disable_initial_unsolicited            varchar(255)
                    constraint ps_globals_mwi_disable_initial_unsolicited_check
                        check ((mwi_disable_initial_unsolicited)::text = ANY
                               ((ARRAY ['0'::character varying, '1'::character varying, 'off'::character varying, 'on'::character varying, 'false'::character varying, 'true'::character varying, 'no'::character varying, 'yes'::character varying])::text[])),
                ignore_uri_user_options                    varchar(255)
                    constraint ps_globals_ignore_uri_user_options_check
                        check ((ignore_uri_user_options)::text = ANY
                               ((ARRAY ['0'::character varying, '1'::character varying, 'off'::character varying, 'on'::character varying, 'false'::character varying, 'true'::character varying, 'no'::character varying, 'yes'::character varying])::text[])),
                use_callerid_contact                       varchar(255)
                    constraint ps_globals_use_callerid_contact_check
                        check ((use_callerid_contact)::text = ANY
                               ((ARRAY ['0'::character varying, '1'::character varying, 'off'::character varying, 'on'::character varying, 'false'::character varying, 'true'::character varying, 'no'::character varying, 'yes'::character varying])::text[])),
                send_contact_status_on_update_registration varchar(255)
                    constraint ps_globals_send_contact_status_on_update_registration_check
                        check ((send_contact_status_on_update_registration)::text = ANY
                               ((ARRAY ['0'::character varying, '1'::character varying, 'off'::character varying, 'on'::character varying, 'false'::character varying, 'true'::character varying, 'no'::character varying, 'yes'::character varying])::text[])),
                taskprocessor_overload_trigger             varchar(255)
                    constraint ps_globals_taskprocessor_overload_trigger_check
                        check ((taskprocessor_overload_trigger)::text = ANY
                               ((ARRAY ['none'::character varying, 'global'::character varying, 'pjsip_only'::character varying])::text[])),
                norefersub                                 varchar(255)
                    constraint ps_globals_norefersub_check
                        check ((norefersub)::text = ANY
                               ((ARRAY ['0'::character varying, '1'::character varying, 'off'::character varying, 'on'::character varying, 'false'::character varying, 'true'::character varying, 'no'::character varying, 'yes'::character varying])::text[])),
                allow_sending_180_after_183                varchar(255)
                    constraint ps_globals_allow_sending_180_after_183_check
                        check ((allow_sending_180_after_183)::text = ANY
                               ((ARRAY ['0'::character varying, '1'::character varying, 'off'::character varying, 'on'::character varying, 'false'::character varying, 'true'::character varying, 'no'::character varying, 'yes'::character varying])::text[])),
                all_codecs_on_empty_reinvite               varchar(255)
                    constraint ps_globals_all_codecs_on_empty_reinvite_check
                        check ((all_codecs_on_empty_reinvite)::text = ANY
                               ((ARRAY ['0'::character varying, '1'::character varying, 'off'::character varying, 'on'::character varying, 'false'::character varying, 'true'::character varying, 'no'::character varying, 'yes'::character varying])::text[])),
                default_auth_algorithms_uas                varchar(1024),
                default_auth_algorithms_uac                varchar(1024)
            );

            create table ps_registrations
            (
                id                       varchar(255) not null
                    primary key,
                auth_rejection_permanent varchar(255)
                    constraint ps_registrations_auth_rejection_permanent_check
                        check ((auth_rejection_permanent)::text = ANY
                               ((ARRAY ['0'::character varying, '1'::character varying, 'off'::character varying, 'on'::character varying, 'false'::character varying, 'true'::character varying, 'no'::character varying, 'yes'::character varying])::text[])),
                client_uri               varchar(255),
                contact_user             varchar(40),
                expiration               integer,
                max_retries              integer,
                outbound_auth            varchar(255),
                outbound_proxy           varchar(255),
                retry_interval           integer,
                forbidden_retry_interval integer,
                server_uri               varchar(255),
                transport                varchar(40),
                support_path             varchar(255)
                    constraint ps_registrations_support_path_check
                        check ((support_path)::text = ANY
                               ((ARRAY ['0'::character varying, '1'::character varying, 'off'::character varying, 'on'::character varying, 'false'::character varying, 'true'::character varying, 'no'::character varying, 'yes'::character varying])::text[])),
                fatal_retry_interval     integer,
                line                     varchar(255)
                    constraint ps_registrations_line_check
                        check ((line)::text = ANY
                               ((ARRAY ['0'::character varying, '1'::character varying, 'off'::character varying, 'on'::character varying, 'false'::character varying, 'true'::character varying, 'no'::character varying, 'yes'::character varying])::text[])),
                endpoint                 varchar(255),
                support_outbound         varchar(255)
                    constraint ps_registrations_support_outbound_check
                        check ((support_outbound)::text = ANY
                               ((ARRAY ['0'::character varying, '1'::character varying, 'off'::character varying, 'on'::character varying, 'false'::character varying, 'true'::character varying, 'no'::character varying, 'yes'::character varying])::text[])),
                contact_header_params    varchar(255),
                max_random_initial_delay integer,
                security_negotiation     varchar(255)
                    constraint ps_registrations_security_negotiation_check
                        check ((security_negotiation)::text = ANY
                               ((ARRAY ['no'::character varying, 'mediasec'::character varying])::text[])),
                security_mechanisms      varchar(512),
                user_agent               varchar(255)
            );

            create table ps_transports
            (
                id                          varchar(40) not null
                    primary key,
                async_operations            integer,
                bind                        varchar(40),
                ca_list_file                varchar(200),
                cert_file                   varchar(200),
                cipher                      varchar(200),
                domain                      varchar(40),
                external_media_address      varchar(40),
                external_signaling_address  varchar(40),
                external_signaling_port     integer,
                method                      varchar(255)
                    constraint ps_transports_method_check
                        check ((method)::text = ANY
                               ((ARRAY ['default'::character varying, 'unspecified'::character varying, 'tlsv1'::character varying, 'tlsv1_1'::character varying, 'tlsv1_2'::character varying, 'tlsv1_3'::character varying, 'sslv2'::character varying, 'sslv23'::character varying, 'sslv3'::character varying])::text[])),
                local_net                   varchar(40),
                password                    varchar(40),
                priv_key_file               varchar(200),
                protocol                    varchar(255)
                    constraint ps_transports_protocol_check
                        check ((protocol)::text = ANY
                               ((ARRAY ['udp'::character varying, 'tcp'::character varying, 'tls'::character varying, 'ws'::character varying, 'wss'::character varying, 'flow'::character varying])::text[])),
                require_client_cert         varchar(255)
                    constraint ps_transports_require_client_cert_check
                        check ((require_client_cert)::text = ANY
                               ((ARRAY ['0'::character varying, '1'::character varying, 'off'::character varying, 'on'::character varying, 'false'::character varying, 'true'::character varying, 'no'::character varying, 'yes'::character varying])::text[])),
                verify_client               varchar(255)
                    constraint ps_transports_verify_client_check
                        check ((verify_client)::text = ANY
                               ((ARRAY ['0'::character varying, '1'::character varying, 'off'::character varying, 'on'::character varying, 'false'::character varying, 'true'::character varying, 'no'::character varying, 'yes'::character varying])::text[])),
                verify_server               varchar(255)
                    constraint ps_transports_verify_server_check
                        check ((verify_server)::text = ANY
                               ((ARRAY ['0'::character varying, '1'::character varying, 'off'::character varying, 'on'::character varying, 'false'::character varying, 'true'::character varying, 'no'::character varying, 'yes'::character varying])::text[])),
                tos                         varchar(10),
                cos                         integer,
                allow_reload                varchar(255)
                    constraint ps_transports_allow_reload_check
                        check ((allow_reload)::text = ANY
                               ((ARRAY ['0'::character varying, '1'::character varying, 'off'::character varying, 'on'::character varying, 'false'::character varying, 'true'::character varying, 'no'::character varying, 'yes'::character varying])::text[])),
                symmetric_transport         varchar(255)
                    constraint ps_transports_symmetric_transport_check
                        check ((symmetric_transport)::text = ANY
                               ((ARRAY ['0'::character varying, '1'::character varying, 'off'::character varying, 'on'::character varying, 'false'::character varying, 'true'::character varying, 'no'::character varying, 'yes'::character varying])::text[])),
                allow_wildcard_certs        varchar(255)
                    constraint ps_transports_allow_wildcard_certs_check
                        check ((allow_wildcard_certs)::text = ANY
                               ((ARRAY ['0'::character varying, '1'::character varying, 'off'::character varying, 'on'::character varying, 'false'::character varying, 'true'::character varying, 'no'::character varying, 'yes'::character varying])::text[])),
                tcp_keepalive_enable        boolean,
                tcp_keepalive_idle_time     integer,
                tcp_keepalive_interval_time integer,
                tcp_keepalive_probe_count   integer
            );

         CREATE TABLE ps_extensions (
            id SERIAL PRIMARY KEY,
            context VARCHAR(40) NOT NULL,
            exten VARCHAR(40) NOT NULL,
            priority INTEGER NOT NULL DEFAULT 1,
            app VARCHAR(40) NOT NULL,
            appdata VARCHAR(256),
            UNIQUE (context, exten, priority)
        );
        ");
    }

    public function down(): void
    {
        Schema::dropIfExists('ps_transports');
        Schema::dropIfExists('ps_registrations');
        Schema::dropIfExists('ps_globals');
        Schema::dropIfExists('ps_endpoints');
        Schema::dropIfExists('ps_endpoint_id_ips');
        Schema::dropIfExists('ps_domain_aliases');
        Schema::dropIfExists('ps_contacts');
        Schema::dropIfExists('ps_auths');
        Schema::dropIfExists('ps_aors');
    }
};
