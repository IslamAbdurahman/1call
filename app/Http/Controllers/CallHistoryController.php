<?php

namespace App\Http\Controllers;

use App\Models\CallHistory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\StreamedResponse;

class CallHistoryController extends Controller
{
    public function index(Request $request)
    {
        $query = CallHistory::query();

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('src', 'ilike', "%{$search}%")
                    ->orWhere('dst', 'ilike', "%{$search}%")
                    ->orWhere('external_number', 'ilike', "%{$search}%")
                    ->orWhere('call_id', 'ilike', "%{$search}%");
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        if ($request->filled('date_from')) {
            $query->whereDate('date_time', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->whereDate('date_time', '<=', $request->date_to);
        }

        $histories = $query->latest('date_time')->paginate(20)->withQueryString();

        return Inertia::render('call-histories/index', [
            'histories' => $histories,
            'filters' => $request->only(['search', 'status', 'type', 'date_from', 'date_to']),
        ]);
    }

    /**
     * Stream the recorded audio file to the browser.
     */
    public function playRecording(CallHistory $callHistory): StreamedResponse
    {
        $path = $callHistory->recorded_file;

        abort_if(empty($path), 404, 'No recording available.');

        // Support absolute paths stored in the DB
        if (file_exists($path)) {
            $mime = mime_content_type($path) ?: 'audio/mpeg';
            return response()->stream(function () use ($path) {
                readfile($path);
            }, 200, [
                'Content-Type' => $mime,
                'Content-Disposition' => 'inline',
                'Content-Length' => filesize($path),
                'Accept-Ranges' => 'bytes',
            ]);
        }

        // Fallback: try Laravel storage disk
        abort_if(!Storage::exists($path), 404, 'Recording file not found.');

        return Storage::download($path, basename($path), [
            'Content-Type' => 'audio/mpeg',
        ]);
    }
}