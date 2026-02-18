<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Group extends Model
{
    use HasFactory;

    protected $fillable = ['name'];

    public function operators()
    {
        return $this->hasMany(Operator::class);
    }

    public function sipNumbers()
    {
        return $this->hasMany(SipNumber::class);
    }

    public function contacts()
    {
        return $this->hasMany(Contact::class);
    }
}