<?php

namespace App\Http\Controllers;

use App\Models\Operator;
use App\Models\Group;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;

class OperatorController extends Controller
{
    public function index()
    {
        // Get online extensions from ps_contacts (Asterisk PJSIP realtime)
        $onlineExtensions = [];
        if (Schema::hasTable('ps_contacts')) {
            $onlineExtensions = DB::table('ps_contacts')
                ->whereNotNull('endpoint')
                ->pluck('endpoint')
                ->unique()
                ->values()
                ->toArray();
        }

        return Inertia::render('operators/index', [
            'operators' => Operator::with('group')->get(),
            'groups' => Group::all(),
            'onlineExtensions' => $onlineExtensions,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'extension' => 'required|string|unique:operators,extension',
            'password' => 'required|string|min:4',
            'group_id' => 'required|exists:groups,id'
        ]);
        Operator::create($validated);
        return redirect()->back();
    }

    public function update(Request $request, Operator $operator)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'extension' => 'required|string|unique:operators,extension,' . $operator->id,
            'password' => 'nullable|string|min:4',
            'group_id' => 'required|exists:groups,id'
        ]);
        if (empty($validated['password'])) {
            unset($validated['password']);
        }
        $operator->update($validated);
        return redirect()->back();
    }

    public function destroy(Operator $operator)
    {
        $operator->delete();
        return redirect()->back();
    }
}