<?php

namespace App\Http\Controllers;

use App\Actions\SipNumber\CreateSipNumberAction;
use App\Actions\SipNumber\DeleteSipNumberAction;
use App\Actions\SipNumber\UpdateSipNumberAction;
use App\Http\Requests\StoreSipNumberRequest;
use App\Http\Requests\UpdateSipNumberRequest;
use App\Models\Group;
use App\Models\SipNumber;
use Inertia\Inertia;

class SipNumberController extends Controller
{
    public function index()
    {
        return Inertia::render('sip-numbers/index', [
            'sipNumbers' => SipNumber::with('group')->get(),
            'groups' => Group::all(),
        ]);
    }

    public function store(StoreSipNumberRequest $request, CreateSipNumberAction $createSipNumberAction)
    {
        $createSipNumberAction->execute($request->validated());

        return redirect()->back();
    }

    public function update(UpdateSipNumberRequest $request, SipNumber $sipNumber, UpdateSipNumberAction $updateSipNumberAction)
    {
        $updateSipNumberAction->execute($sipNumber, $request->validated());

        return redirect()->back();
    }

    public function destroy(SipNumber $sipNumber, DeleteSipNumberAction $deleteSipNumberAction)
    {
        $deleteSipNumberAction->execute($sipNumber);

        return redirect()->back();
    }
}
