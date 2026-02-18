<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PsExtension extends Model
{
    /**
     * Asterisk Realtime dialplan jadvali nomi.
     */
    protected $table = 'ps_extensions';

    /**
     * Realtime jadvallarida odatda 'created_at' va 'updated_at' ustunlari bo'lmaydi.
     */
    public $timestamps = false;

    /**
     * Ommaviy to'ldiriladigan maydonlar.
     * DIQQAT: 'appdata' ustuniga e'tibor bering (ostki chiziqsiz).
     */
    protected $fillable = [
        'context',
        'exten',
        'priority',
        'app',
        'appdata',
    ];

    /**
     * Odatiy qiymatlarni o'rnatish uchun (ixtiyoriy)
     */
    protected $attributes = [
        'context' => 'from-internal',
        'priority' => 1,
        'app' => 'Stasis',
        'appdata' => 'onecall',
    ];
}
