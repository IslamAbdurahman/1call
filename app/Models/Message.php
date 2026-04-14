<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * @property \App\Models\User|null $user
 * @property \Illuminate\Database\Eloquent\Collection<int, \App\Models\User> $reads
 */
class Message extends Model
{
    use HasFactory;

    protected $fillable = ['user_id', 'receiver_id', 'content'];

    public function user(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function receiver()
    {
        return $this->belongsTo(User::class, 'receiver_id');
    }

    public function reads(): \Illuminate\Database\Eloquent\Relations\BelongsToMany
    {
        return $this->belongsToMany(User::class, 'message_reads')->withPivot('read_at');
    }
}
