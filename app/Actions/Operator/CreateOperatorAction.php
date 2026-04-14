<?php

namespace App\Actions\Operator;

use App\Models\User;
use App\Models\Group;
use Illuminate\Support\Facades\Hash;

class CreateOperatorAction
{
    public function execute(array $data): User
    {
        $extension = $data['extension'] ?? null;

        if (!$extension) {
            $group = Group::findOrFail($data['group_id']);
            
            $maxExtension = User::where('group_id', $group->id)
                ->whereRaw('extension ~ \'^[0-9]+$\'')
                ->max('extension');

            if ($maxExtension) {
                $extension = (int) $maxExtension + 1;
            } elseif ($group->start_number) {
                $extension = $group->start_number + 1;
            } else {
                // Default if no start_number and no users
                $extension = 101; 
            }

            // Ensure uniqueness globally if generated
            while (User::where('extension', $extension)->exists()) {
                $extension++;
            }
        }

        $user = User::create([
            'name' => $data['name'],
            'email' => null,
            'extension' => (string) $extension,
            'password' => Hash::make($data['password']),
            'sip_password' => $data['password'],
            'group_id' => $data['group_id'],
        ]);

        $user->assignRole('operator');

        return $user;
    }
}
