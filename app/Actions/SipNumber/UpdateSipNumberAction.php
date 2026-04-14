<?php

namespace App\Actions\SipNumber;

use App\Models\SipNumber;

class UpdateSipNumberAction
{
    public function execute(SipNumber $sipNumber, array $data): bool
    {
        return $sipNumber->update($data);
    }
}
