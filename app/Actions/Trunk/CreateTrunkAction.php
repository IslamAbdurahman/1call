<?php

namespace App\Actions\Trunk;

use App\Models\Trunk;

class CreateTrunkAction
{
    public function execute(array $data): Trunk
    {
        return Trunk::create($data);
    }
}
