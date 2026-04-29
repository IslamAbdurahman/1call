<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PsEndpointIdIp extends Model
{
    use HasFactory;

    protected $table = 'ps_endpoint_id_ips';

    // Disable timestamp if the table does not have created_at/updated_at
    public $timestamps = false;

    // The primary key is 'id' but it is a string.
    protected $primaryKey = 'id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'endpoint',
        'match',
        'srv_lookups',
        'match_header',
    ];
}
