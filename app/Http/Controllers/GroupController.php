<?php

namespace App\Http\Controllers;

use App\Actions\Group\CreateGroupAction;
use App\Actions\Group\DeleteGroupAction;
use App\Actions\Group\UpdateGroupAction;
use App\Http\Requests\StoreGroupRequest;
use App\Http\Requests\UpdateGroupRequest;
use App\Models\Group;
use Inertia\Inertia;

class GroupController extends Controller
{
    public function index()
    {
        return Inertia::render('groups/index', [
            'groups' => Group::withCount(['operators', 'sipNumbers'])->get(),
        ]);
    }

    public function store(StoreGroupRequest $request, CreateGroupAction $createGroupAction)
    {
        $createGroupAction->execute($request->validated());

        return redirect()->back();
    }

    public function update(UpdateGroupRequest $request, Group $group, UpdateGroupAction $updateGroupAction)
    {
        $updateGroupAction->execute($group, $request->validated());

        return redirect()->back();
    }

    public function destroy(Group $group, DeleteGroupAction $deleteGroupAction)
    {
        $deleteGroupAction->execute($group);

        return redirect()->back();
    }
}
