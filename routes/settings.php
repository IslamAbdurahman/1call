<?php

use App\Http\Controllers\Settings\PasswordController;
use App\Http\Controllers\Settings\ProfileController;
use App\Http\Controllers\Settings\TwoFactorAuthenticationController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::middleware(['auth'])->group(function () {
    Route::redirect('settings', '/settings/profile');

    Route::get('settings/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('settings/profile', [ProfileController::class, 'update'])->name('profile.update');
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::delete('settings/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::get('settings/password', [PasswordController::class, 'edit'])->name('user-password.edit');

    Route::put('settings/password', [PasswordController::class, 'update'])
        ->middleware('throttle:6,1')
        ->name('user-password.update');

    Route::get('settings/appearance', function () {
        return Inertia::render('settings/appearance');
    })->name('appearance.edit');

    Route::get('settings/two-factor', [TwoFactorAuthenticationController::class, 'show'])
        ->name('two-factor.show');

    // Server Settings
    Route::get('settings/server', [\App\Http\Controllers\Settings\ServerController::class, 'index'])->name('server.show');
    Route::post('settings/server/dialplan', [\App\Http\Controllers\Settings\ServerController::class, 'dialplanStore'])->name('server.dialplan.store');
    Route::delete('settings/server/dialplan/{exten}', [\App\Http\Controllers\Settings\ServerController::class, 'dialplanDestroy'])->name('server.dialplan.destroy');
    Route::put('settings/server/network', [\App\Http\Controllers\Settings\ServerController::class, 'networkUpdate'])->name('server.network.update');
    Route::post('settings/server/asterisk/command', [\App\Http\Controllers\Settings\ServerController::class, 'asteriskCommand'])->name('server.asterisk.command');
});
