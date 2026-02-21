<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return Inertia::render('welcome', [
    'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', function () {
            return Inertia::render('dashboard', [
            'stats' => [
            'groups' => \App\Models\Group::count(),
            'operators' => \App\Models\Operator::count(),
            'sipNumbers' => \App\Models\SipNumber::count(),
            'contacts' => \App\Models\Contact::count(),
            'callsToday' => \App\Models\CallHistory::whereDate('date_time', today())->count(),
            'callsAnswered' => \App\Models\CallHistory::whereDate('date_time', today())->where('status', 'answered')->count(),
            'callsMissed' => \App\Models\CallHistory::whereDate('date_time', today())->where('status', 'no-answer')->count(),
            ],
            ]);
        }
        )->name('dashboard');

        Route::resource('groups', App\Http\Controllers\GroupController::class);
        Route::resource('operators', App\Http\Controllers\OperatorController::class);
        Route::resource('sip-numbers', App\Http\Controllers\SipNumberController::class)->parameters(['sip-numbers' => 'sipNumber']);
        Route::resource('contacts', App\Http\Controllers\ContactController::class);

        Route::resource('call-histories', App\Http\Controllers\CallHistoryController::class)->only(['index']);
        Route::get('call-histories/{callHistory}/play', [App\Http\Controllers\CallHistoryController::class , 'playRecording'])
            ->name('call-histories.play');
    });

require __DIR__ . '/settings.php';