<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Models\PsExtension;
use App\Services\Asterisk\AsteriskCliService;
use App\Services\Asterisk\NetplanService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ServerController extends Controller
{
    /**
     * Render the server settings page with data for all tabs.
     */
    public function index(NetplanService $netplanService, AsteriskCliService $asteriskCli)
    {
        // 1. Dialplan data
        // For simplicity, we just fetch from ps_extensions where context is from-external or from-internal
        // Assuming user primarily manages DIDs pointing to Stasis
        $dialplans = PsExtension::where('app', 'Stasis')
            ->orderBy('exten')
            ->get();

        // 2. Network data
        $networkConfig = $netplanService->getEth1Config();

        // 3. Asterisk status
        $asteriskVersion = $asteriskCli->getVersion();
        $isAsteriskRunning = !empty($asteriskVersion);
        $activeCalls = $asteriskCli->getActiveCallsCount();
        $endpoints = $asteriskCli->getEndpoints();

        return Inertia::render('settings/server', [
            'dialplans' => $dialplans,
            'network' => $networkConfig,
            'asterisk' => [
                'running' => $isAsteriskRunning,
                'version' => $asteriskVersion,
                'activeCalls' => $activeCalls,
                'endpoints' => $endpoints,
            ],
        ]);
    }

    /**
     * Store a new DID entry in dialplan (ps_extensions).
     */
    public function dialplanStore(Request $request)
    {
        $validated = $request->validate([
            'exten' => 'required|string|max:40',
            'context' => 'required|string|max:40',
        ]);

        // Add 1,Stasis(1call)
        PsExtension::updateOrCreate(
            [
                'exten' => $validated['exten'],
                'context' => $validated['context'],
                'priority' => 1,
            ],
            [
                'app' => 'Stasis',
                'appdata' => '1call',
            ]
        );

        // Add n,Hangup()
        PsExtension::updateOrCreate(
            [
                'exten' => $validated['exten'],
                'context' => $validated['context'],
                'priority' => 2,
            ],
            [
                'app' => 'Hangup',
                'appdata' => '',
            ]
        );

        return back()->with('success', 'DID added successfully.');
    }

    /**
     * Remove a DID from dialplan.
     */
    public function dialplanDestroy($exten)
    {
        PsExtension::where('exten', $exten)->delete();
        
        return back()->with('success', 'DID removed successfully.');
    }

    /**
     * Update eth1 configuration.
     */
    public function networkUpdate(Request $request, NetplanService $netplanService)
    {
        $validated = $request->validate([
            'ip' => 'required|ipv4',
            'mask' => 'required|ipv4',
            'gateway' => 'required|ipv4',
        ]);

        $success = $netplanService->updateEth1Config(
            $validated['ip'],
            $validated['mask'],
            $validated['gateway']
        );

        if (!$success) {
            return back()->withErrors(['network' => 'Failed to apply network configuration. Check logs.']);
        }

        return back()->with('success', 'Network configuration applied.');
    }

    /**
     * Run an Asterisk CLI command.
     */
    public function asteriskCommand(Request $request, AsteriskCliService $asteriskCli)
    {
        $validated = $request->validate([
            'command' => 'required|in:reload,restart',
        ]);

        $success = false;
        if ($validated['command'] === 'reload') {
            $success = $asteriskCli->reloadDialplan();
        } elseif ($validated['command'] === 'restart') {
            $success = $asteriskCli->restartAsterisk();
        }

        if (!$success) {
            return back()->withErrors(['asterisk' => "Failed to {$validated['command']} Asterisk."]);
        }

        return back()->with('success', "Asterisk {$validated['command']} command executed.");
    }
}
