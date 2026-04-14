<?php

namespace App\Actions\Group;

use App\Models\Group;

class CreateGroupAction
{
    public function execute(array $data): Group
    {
        return Group::create($data);
    }
}
