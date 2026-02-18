<?php

namespace App\Http\Controllers;

use App\Models\CallLog;
use Inertia\Inertia;

class CallLogController extends Controller
{
    public function index()
    {
        return Inertia::render('call-logs/index', [
            'logs' => CallLog::with(['operator', 'sipNumber', 'contact'])
            ->latest()
            ->paginate(20)
        ]);
    }
}