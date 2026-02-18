<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CallLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'operator_id',
        'sip_number_id',
        'contact_id',
        'start_time',
        'end_time',
        'duration',
        'status',
        'recording_path'
    ];

    public function operator()
    {
        return $this->belongsTo(Operator::class);
    }

    public function sipNumber()
    {
        return $this->belongsTo(SipNumber::class);
    }

    public function contact()
    {
        return $this->belongsTo(Contact::class);
    }
}