<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PsEndpoint extends Model
{
    use HasFactory;

    protected $table = 'ps_endpoints';
    protected $keyType = 'string';
    public $incrementing = false;
    public $timestamps = false; // Asterisk tables usually don't have timestamps unless customized

    protected $guarded = [];
}