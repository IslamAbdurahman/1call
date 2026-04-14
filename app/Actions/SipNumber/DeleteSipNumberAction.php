<?php

namespace App\Actions\SipNumber;

use App\Models\SipNumber;

class DeleteSipNumberAction
{
    public function execute(SipNumber $sipNumber): bool
    {
        return $sipNumber->delete() ?? false;
    }
}
