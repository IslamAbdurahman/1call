<?php

namespace App\Actions\Operator;

use App\Models\User;

class DeleteOperatorAction
{
    public function execute(User $operator): bool
    {
        return $operator->delete() ?? false;
    }
}
