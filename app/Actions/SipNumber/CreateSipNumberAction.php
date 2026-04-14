<?php

namespace App\Actions\SipNumber;

use App\Models\SipNumber;

class CreateSipNumberAction
{
    public function execute(array $data): SipNumber
    {
        return SipNumber::create($data);
    }
}
