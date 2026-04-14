<?php

namespace App\Http\Controllers;

use App\Actions\Trunk\CreateTrunkAction;
use App\Actions\Trunk\DeleteTrunkAction;
use App\Actions\Trunk\UpdateTrunkAction;
use App\Http\Requests\StoreTrunkRequest;
use App\Http\Requests\UpdateTrunkRequest;
use App\Models\Trunk;
use Inertia\Inertia;

class TrunkController extends Controller
{
    public function index()
    {
        return Inertia::render('trunks/index', [
            'trunks' => Trunk::latest()->get(),
        ]);
    }

    public function store(StoreTrunkRequest $request, CreateTrunkAction $createTrunkAction)
    {
        $createTrunkAction->execute($request->validated());

        return redirect()->back();
    }

    public function update(UpdateTrunkRequest $request, Trunk $trunk, UpdateTrunkAction $updateTrunkAction)
    {
        $updateTrunkAction->execute($trunk, $request->validated());

        return redirect()->back();
    }

    public function destroy(Trunk $trunk, DeleteTrunkAction $deleteTrunkAction)
    {
        $deleteTrunkAction->execute($trunk);

        return redirect()->back();
    }
}
