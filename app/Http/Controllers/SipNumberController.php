<?php

namespace App\Http\Controllers;

use App\Models\SipNumber;
use App\Models\Group;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SipNumberController extends Controller
{
    public function index()
    {
        return Inertia::render('sip-numbers/index', [
            'sipNumbers' => SipNumber::with('group')->get(),
            'groups' => Group::all()
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'number' => 'required|string|unique:sip_numbers,number',
            'group_id' => 'nullable|exists:groups,id'
        ]);
        SipNumber::create($validated);
        return redirect()->back();
    }

    public function update(Request $request, SipNumber $sipNumber)
    {
        $validated = $request->validate([
            'number' => 'required|string|unique:sip_numbers,number,' . $sipNumber->id,
            'group_id' => 'nullable|exists:groups,id'
        ]);
        $sipNumber->update($validated);
        return redirect()->back();
    }

    public function destroy(SipNumber $sipNumber)
    {
        $sipNumber->delete();
        return redirect()->back();
    }
}