<?php

namespace App\Http\Controllers;

use App\Models\Contact;
use App\Models\Group;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ContactController extends Controller
{
    public function index()
    {
        return Inertia::render('contacts/index', [
            'contacts' => Contact::with('group')->paginate(10),
            'groups' => Group::all()
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'required|string|max:255',
            'group_id' => 'nullable|exists:groups,id'
        ]);
        Contact::create($validated);
        return redirect()->back();
    }

    public function update(Request $request, Contact $contact)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'required|string|max:255',
            'group_id' => 'nullable|exists:groups,id'
        ]);
        $contact->update($validated);
        return redirect()->back();
    }

    public function destroy(Contact $contact)
    {
        $contact->delete();
        return redirect()->back();
    }
}