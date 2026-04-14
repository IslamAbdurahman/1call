<?php

namespace App\Actions\Trunk;

use App\Models\Trunk;

class UpdateTrunkAction
{
    public function execute(Trunk $trunk, array $data): bool
    {
        return $trunk->update($data);
    }
}
