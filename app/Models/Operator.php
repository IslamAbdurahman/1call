<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Operator extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'extension', 'password', 'group_id'];

    public function group()
    {
        return $this->belongsTo(Group::class);
    }
}