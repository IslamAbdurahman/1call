<?php

namespace App\Actions\Trunk;

use App\Models\Trunk;

class DeleteTrunkAction
{
    public function execute(Trunk $trunk): bool
    {
        return $trunk->delete() ?? false;
    }
}
