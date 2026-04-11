import AppLayout from '@/layouts/app-layout';
import { Head, useForm, usePage } from '@inertiajs/react';
import { useEffect, useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface User {
    id: number;
    name: string;
}

interface Message {
    id: number;
    content: string;
    user: User;
    created_at: string;
}

interface ChatProps {
    messages: Message[];
}

export default function Chat({ messages: initialMessages }: ChatProps) {
    const { auth } = usePage().props as any;
    const [messages, setMessages] = useState<Message[]>(initialMessages);
    const scrollRef = useRef<HTMLDivElement>(null);

    const { data, setData, post, processing, reset } = useForm({
        content: '',
    });

    // Inertia props yangilanganda (o'zimiz xabar yuborganimizda)
    useEffect(() => {
        setMessages(initialMessages);
    }, [initialMessages]);

    useEffect(() => {
        console.log('Echo joining chat channel...');
        
        const channel = window.Echo.join('chat')
            .here((users: any) => {
                console.log('Joined chat! Online users:', users);
            })
            .listen('.message.sent', (e: Message) => {
                console.log('New message received via Echo:', e);
                // Agar xabar boshqa odamdan kelgan bo'lsa, uni ro'yxatga qo'shamiz
                if (e.user.id !== auth.user.id) {
                    setMessages((prev) => {
                        if (prev.find(m => m.id === e.id)) return prev;
                        return [...prev, e];
                    });
                }
            })
            .error((error: any) => {
                console.error('Echo channel error:', error);
            });

        return () => {
            console.log('Leaving chat channel');
            window.Echo.leave('chat');
        };
    }, [auth.user.id]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!data.content.trim()) return;

        post('/chat', {
            onSuccess: () => {
                reset();
            },
            preserveScroll: true,
        });
    };

    return (
        <AppLayout>
            <Head title="Chat" />

            <div className="flex flex-col h-[calc(100vh-10rem)] max-w-4xl mx-auto px-4 sm:px-0">
                <Card className="flex-1 overflow-hidden flex flex-col border shadow-lg">
                    <div className="p-4 border-b font-semibold bg-muted/50 flex justify-between items-center">
                        <span>Guruh Chati</span>
                    </div>
                    
                    <div 
                        ref={scrollRef}
                        className="flex-1 overflow-y-auto p-4 space-y-4 bg-background"
                    >
                        {messages.map((message) => (
                            <div 
                                key={`${message.id}-${message.created_at}`}
                                className={`flex ${message.user.id === auth.user.id ? 'justify-end' : 'justify-start'}`}
                            >
                                <div className={`flex max-w-[85%] sm:max-w-[70%] ${message.user.id === auth.user.id ? 'flex-row-reverse' : 'flex-row'} items-end gap-2`}>
                                    <Avatar className="h-8 w-8 shrink-0">
                                        <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                                            {message.user.name.substring(0, 2).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className={`p-3 rounded-2xl shadow-sm ${
                                        message.user.id === auth.user.id 
                                        ? 'bg-primary text-primary-foreground rounded-br-none' 
                                        : 'bg-muted rounded-bl-none'
                                    }`}>
                                        <div className="text-[10px] font-bold mb-1 opacity-80 uppercase tracking-wider">{message.user.name}</div>
                                        <div className="text-sm leading-relaxed break-words">{message.content}</div>
                                        <div className="text-[9px] opacity-60 mt-1 text-right">
                                            {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <form onSubmit={submit} className="p-4 border-t bg-muted/30 flex gap-2">
                        <Input
                            placeholder="Xabar yozing..."
                            value={data.content}
                            onChange={(e) => setData('content', e.target.value)}
                            disabled={processing}
                            className="bg-background"
                            autoComplete="off"
                        />
                        <Button type="submit" disabled={processing || !data.content.trim()}>
                            {processing ? '...' : 'Yuborish'}
                        </Button>
                    </form>
                </Card>
            </div>
        </AppLayout>
    );
}
