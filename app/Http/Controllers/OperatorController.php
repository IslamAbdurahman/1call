<?php

namespace App\Http\Controllers;

use App\Models\Group;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
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
            $ariUrl = env('ARI_HOST', 'localhost:8088');
            $ariUrl = rtrim(str_replace(['http://', 'https://'], '', $ariUrl), '/');
            $ariUrl = "http://{$ariUrl}/ari/channels";
            $ariUser = env('ARI_USER', '1call');
            $ariPass = env('ARI_PASSWORD', '11221122');

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

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'extension' => 'required|string|unique:users,extension',
            'password' => 'required|string|min:4',
            'group_id' => 'required|exists:groups,id',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => null,
            'extension' => $validated['extension'],
            'password' => Hash::make($validated['password']),
            'sip_password' => $validated['password'], // ochiq matnli parol
            'group_id' => $validated['group_id'],
        ]);

        $user->assignRole('operator');

        return redirect()->back();
    }

    public function update(Request $request, User $operator)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'extension' => 'required|string|unique:users,extension,'.$operator->id,
            'password' => 'nullable|string|min:4',
            'group_id' => 'required|exists:groups,id',
        ]);

        $data = [
            'name' => $validated['name'],
            'extension' => $validated['extension'],
            'email' => $validated['extension'].'@1call.uz',
            'group_id' => $validated['group_id'],
        ];

        if (! empty($validated['password'])) {
            $data['password'] = Hash::make($validated['password']);
            $data['sip_password'] = $validated['password'];
        }

        $operator->update($data);

        return redirect()->back();
    }

    public function destroy(User $operator)
    {
        $operator->delete();

        return redirect()->back();
    }
}
