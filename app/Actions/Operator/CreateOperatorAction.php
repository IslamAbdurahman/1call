<?php

namespace App\Actions\Operator;

use App\Models\User;
use Illuminate\Support\Facades\Hash;

class CreateOperatorAction
{
    public function execute(array $data): User
    {
        $user = User::create([
            'name' => $data['name'],
            'email' => null,
            'extension' => $data['extension'],
            'password' => Hash::make($data['password']),
            'sip_password' => $data['password'],
            'group_id' => $data['group_id'],
        ]);

        $user->assignRole('operator');

        return $user;
    }
}
