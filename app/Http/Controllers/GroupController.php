<?php

namespace App\Http\Controllers;

use App\Models\Group;
use Illuminate\Http\Request;
use Inertia\Inertia;

class GroupController extends Controller
{
    public function index()
    {
        return Inertia::render('groups/index', [
            'groups' => Group::withCount(['operators', 'sipNumbers'])->get()
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate(['name' => 'required|string|max:255']);
        Group::create($validated);
        return redirect()->back();
    }

    public function update(Request $request, Group $group)
    {
        $validated = $request->validate(['name' => 'required|string|max:255']);
        $group->update($validated);
        return redirect()->back();
    }

    public function destroy(Group $group)
    {
        $group->delete();
        return redirect()->back();
    }
}