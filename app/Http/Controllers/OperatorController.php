<?php

namespace App\Http\Controllers;

use App\Actions\Operator\CreateOperatorAction;
use App\Actions\Operator\DeleteOperatorAction;
use App\Actions\Operator\UpdateOperatorAction;
use App\Http\Requests\StoreOperatorRequest;
use App\Http\Requests\UpdateOperatorRequest;
use App\Models\Group;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;

class OperatorController extends Controller
{
    public function index()
    {
        // Asterisk real-time holati (pjsip online raqamlar)
        $onlineExtensions = [];
        if (Schema::hasTable('ps_contacts')) {
            $onlineExtensions = DB::table('ps_contacts')
                ->whereNotNull('endpoint')
                ->pluck('endpoint')
                ->unique()
                ->values()
                ->toArray();
        }

        // Asterisk ARI orqali hozirda gaplashayotgan/band raqamlarni olish
        $busyExtensions = [];
        try {
            $ariUrl = config('asterisk.ari_host', 'localhost:8088');
            $ariUrl = rtrim(str_replace(['http://', 'https://'], '', $ariUrl), '/');
            $ariUrl = "http://{$ariUrl}/ari/channels";
            $ariUser = config('asterisk.ari_user', '1call');
            $ariPass = config('asterisk.ari_password', '11221122');

            $response = \Illuminate\Support\Facades\Http::withBasicAuth($ariUser, $ariPass)->get($ariUrl);

            if ($response->successful()) {
                $channels = $response->json();
                foreach ($channels as $channel) {
                    $name = $channel['name'] ?? '';
                    if (preg_match('/PJSIP\/([^\-]+)/', $name, $matches)) {
                        $busyExtensions[] = $matches[1];
                    }
                }
            }
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::warning("Could not fetch active channels from ARI: " . $e->getMessage());
        }

        return Inertia::render('operators/index', [
            'operators' => User::role('operator')->with('group')->get(),
            'groups' => Group::all(),
            'onlineExtensions' => $onlineExtensions,
            'busyExtensions' => array_values(array_unique($busyExtensions)),
        ]);
    }

    public function store(StoreOperatorRequest $request, CreateOperatorAction $createOperatorAction)
    {
        $createOperatorAction->execute($request->validated());

        return redirect()->back();
    }

    public function update(UpdateOperatorRequest $request, User $operator, UpdateOperatorAction $updateOperatorAction)
    {
        $updateOperatorAction->execute($operator, $request->validated());

        return redirect()->back();
    }

    public function destroy(User $operator, DeleteOperatorAction $deleteOperatorAction)
    {
        $deleteOperatorAction->execute($operator);

        return redirect()->back();
    }
}
