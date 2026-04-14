<?php

namespace App\Http\Controllers;

use App\Actions\Contact\CreateContactAction;
use App\Actions\Contact\DeleteContactAction;
use App\Actions\Contact\UpdateContactAction;
use App\Http\Requests\StoreContactRequest;
use App\Http\Requests\UpdateContactRequest;
use App\Models\Contact;
use App\Models\Group;
use Inertia\Inertia;

class ContactController extends Controller
{
    public function index()
    {
        return Inertia::render('contacts/index', [
            'contacts' => Contact::with('group')->paginate(10),
            'groups' => Group::all(),
        ]);
    }

    public function store(StoreContactRequest $request, CreateContactAction $createContactAction)
    {
        $createContactAction->execute($request->validated());

        return redirect()->back();
    }

    public function update(UpdateContactRequest $request, Contact $contact, UpdateContactAction $updateContactAction)
    {
        $updateContactAction->execute($contact, $request->validated());

        return redirect()->back();
    }

    public function destroy(Contact $contact, DeleteContactAction $deleteContactAction)
    {
        $deleteContactAction->execute($contact);

        return redirect()->back();
    }
}
