<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CallHistory extends Model
{
    use HasFactory;

    protected $fillable = [
        'date_time',
        'src',
        'dst',
        'external_number',
        'duration',
        'conversation',
        'type',
        'status',
        'recorded_file',
        'linked_id',
        'event_count',
        'module',
        'auto_call_id',
        'call_id',
    ];

    protected $casts = [
        'date_time' => 'datetime',
        'duration' => 'integer',
        'event_count' => 'integer',
    ];

    protected $appends = ['contact_name'];

    public function getFormattedDurationAttribute(): string
    {
        $seconds = $this->duration;
        $minutes = intdiv($seconds, 60);
        $secs = $seconds % 60;
        return sprintf('%02d:%02d', $minutes, $secs);
    }

    /**
     * Tashqi raqam bo'yicha kontaktni topish
     */
    public function getContactNameAttribute(): ?string
    {
        if (empty($this->external_number)) {
            return null;
        }

        return Contact::where('phone', $this->external_number)->value('name');
    }
}