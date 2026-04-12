<?php

namespace App\Http\Controllers;

use App\Models\Trunk;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TrunkController extends Controller
{
    public function index()
    {
        return Inertia::render('trunks/index', [
            'trunks' => Trunk::latest()->get(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|unique:trunks,name',
            'host' => 'required|string',
            'port' => 'required|integer',
            'username' => 'nullable|string',
            'password' => 'nullable|string',
            'did' => 'nullable|string',
            'transport' => 'required|string',
            'context' => 'required|string',
            'is_active' => 'required|boolean',
        ]);

        Trunk::create($validated);

        return redirect()->back();
    }

    public function update(Request $request, Trunk $trunk)
    {
        $validated = $request->validate([
            'name' => 'required|string|unique:trunks,name,' . $trunk->id,
            'host' => 'required|string',
            'port' => 'required|integer',
            'username' => 'nullable|string',
            'password' => 'nullable|string',
            'did' => 'nullable|string',
            'transport' => 'required|string',
            'context' => 'required|string',
            'is_active' => 'required|boolean',
        ]);

        $trunk->update($validated);

        return redirect()->back();
    }

    public function destroy(Trunk $trunk)
    {
        $trunk->delete();

        return redirect()->back();
    }
}
