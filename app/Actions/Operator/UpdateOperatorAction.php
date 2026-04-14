<?php

namespace App\Actions\Operator;

use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UpdateOperatorAction
{
    public function execute(User $operator, array $data): bool
    {
        $updateData = [
            'name' => $data['name'],
            'extension' => $data['extension'],
            'email' => $data['extension'].'@1call.uz',
            'group_id' => $data['group_id'],
        ];

        if (! empty($data['password'])) {
            $updateData['password'] = Hash::make($data['password']);
            $updateData['sip_password'] = $data['password'];
        }

        return $operator->update($updateData);
    }
}
