<?php

namespace App\Actions\Group;

use App\Models\Group;

class UpdateGroupAction
{
    public function execute(Group $group, array $data): bool
    {
        return $group->update($data);
    }
}
