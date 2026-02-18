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
            return Inertia::render('dashboard');
        }
        )->name('dashboard');

        Route::resource('groups', App\Http\Controllers\GroupController::class);
        Route::resource('operators', App\Http\Controllers\OperatorController::class);
        Route::resource('sip-numbers', App\Http\Controllers\SipNumberController::class)->parameters(['sip-numbers' => 'sipNumber']);
        Route::resource('contacts', App\Http\Controllers\ContactController::class);
        Route::resource('call-logs', App\Http\Controllers\CallLogController::class)->only(['index']);
    });

require __DIR__ . '/settings.php';