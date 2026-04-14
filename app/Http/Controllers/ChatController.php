<?php

namespace App\Http\Controllers;

use App\Events\MessageRead;
use App\Events\MessageSent;
use App\Models\Message;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ChatController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $user->update(['last_seen_at' => now()]);
        
        $userId = $user->id;

        $operators = User::where('id', '!=', $userId)->get()->map(function ($user) use ($userId) {
            // Count unread messages from this user to me
            $user->unread_count = Message::where('user_id', $user->id)
                ->where('receiver_id', $userId)
                ->whereDoesntHave('reads', function ($q) use ($userId) {
                    $q->where('user_id', $userId);
                })
                ->count();
            
            // Check if there's any message between us
            $lastMessage = Message::where(function ($q) use ($userId, $user) {
                $q->where('user_id', $userId)->where('receiver_id', $user->id);
            })->orWhere(function ($q) use ($userId, $user) {
                $q->where('user_id', $user->id)->where('receiver_id', $userId);
            })->latest()->first();

            $user->last_message_at = $lastMessage?->created_at;
            $user->has_conversation = !is_null($lastMessage);

            return $user;
        })->sortByDesc('last_message_at')->values();

        $generalUnreadCount = Message::whereNull('receiver_id')
            ->where('user_id', '!=', $userId)
            ->whereDoesntHave('reads', function ($q) use ($userId) {
                $q->where('user_id', $userId);
            })
            ->count();

        return Inertia::render('chat', [
            'operators' => $operators,
            'generalUnreadCount' => $generalUnreadCount,
        ]);
    }

    public function messages(Request $request, $receiverId = null)
    {
        $query = Message::with(['user', 'reads']);

        if ($receiverId) {
            $query->where(function ($q) use ($request, $receiverId) {
                $q->where(function ($sq) use ($request, $receiverId) {
                    $sq->where('user_id', $request->user()->id)->where('receiver_id', $receiverId);
                })->orWhere(function ($sq) use ($request, $receiverId) {
                    $sq->where('user_id', $receiverId)->where('receiver_id', $request->user()->id);
                });
            });
        } else {
            $query->whereNull('receiver_id');
        }

        $messages = $query->latest()->take(100)->get()->reverse()->values();

        return response()->json($messages);
    }

    public function store(Request $request)
    {
        $request->validate([
            'content' => 'required|string',
            'receiver_id' => 'nullable|exists:users,id',
        ]);

        $message = $request->user()->messages()->create([
            'content' => $request->content,
            'receiver_id' => $request->receiver_id,
        ]);

        $message->load(['user', 'reads']);

        broadcast(new MessageSent($message))->toOthers();

        // Return the full message object as JSON so the sender can display it
        return response()->json($message);
    }

    public function markAsRead(Request $request, Message $message)
    {
        $user = $request->user();

        // Don't mark own messages as read
        if ($message->user_id === $user->id) {
            return response()->json(['status' => 'success']);
        }

        // Check if already read
        if (!$message->reads()->where('user_id', $user->id)->exists()) {
            $message->reads()->attach($user->id, ['read_at' => now()]);
            
            // Broadcast the read event
            broadcast(new MessageRead($message, $user->id))->toOthers();
        }

        return response()->json(['status' => 'success']);
    }
}
