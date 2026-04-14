<?php

namespace App\Actions\Contact;

use App\Models\Contact;

class UpdateContactAction
{
    public function execute(Contact $contact, array $data): bool
    {
        return $contact->update($data);
    }
}
