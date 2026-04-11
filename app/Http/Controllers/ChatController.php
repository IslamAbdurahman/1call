<?php

namespace App\Http\Controllers;

use App\Events\MessageSent;
use App\Models\Message;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ChatController extends Controller
{
    public function index()
    {
        return Inertia::render('chat', [
            'messages' => Message::with('user')->latest()->take(50)->get()->reverse()->values(),
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'content' => 'required|string',
        ]);

        $message = $request->user()->messages()->create([
            'content' => $request->content,
        ]);

        broadcast(new MessageSent($message))->toOthers();

        return back();
    }
}
