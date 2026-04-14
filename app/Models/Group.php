<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * @property \Illuminate\Database\Eloquent\Collection<int, \App\Models\User> $operators
 */
class Group extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'start_number'];

    public function operators()
    {
        return $this->hasMany(User::class);
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
