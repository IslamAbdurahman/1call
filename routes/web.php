<?php

use App\Http\Controllers\CallHistoryController;
use App\Http\Controllers\ChatController;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\GroupController;
use App\Http\Controllers\OperatorController;
use App\Http\Controllers\SipNumberController;
use App\Models\CallHistory;
use App\Models\Contact;
use App\Models\Group;
use App\Models\SipNumber;
use App\Models\User;
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
                'groups' => Group::count(),
                'operators' => User::role('operator')->count(),
                'sipNumbers' => SipNumber::count(),
                'contacts' => Contact::count(),
                'callsToday' => CallHistory::whereDate('date_time', today())->count(),
                'callsAnswered' => CallHistory::whereDate('date_time', today())->where('status', 'answered')->count(),
                'callsMissed' => CallHistory::whereDate('date_time', today())->where('status', 'no-answer')->count(),
            ],
        ]);
    }
    )->name('dashboard');

    Route::resource('groups', GroupController::class);
    Route::resource('operators', OperatorController::class);
    Route::resource('sip-numbers', SipNumberController::class)->parameters(['sip-numbers' => 'sipNumber']);
    Route::resource('trunks', \App\Http\Controllers\TrunkController::class);
    Route::resource('contacts', ContactController::class);

    Route::resource('call-histories', CallHistoryController::class)->only(['index']);
    Route::get('call-histories/{callHistory}/play', [CallHistoryController::class, 'playRecording'])
        ->name('call-histories.play');

    Route::get('/chat', [ChatController::class, 'index'])->name('chat.index');
    Route::get('/chat/messages/{receiverId?}', [ChatController::class, 'messages'])->name('chat.messages');
    Route::post('/chat', [ChatController::class, 'store'])->name('chat.store');
    Route::post('/chat/{message}/read', [ChatController::class, 'markAsRead'])->name('chat.read');
});

require __DIR__.'/settings.php';
