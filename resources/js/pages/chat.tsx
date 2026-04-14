import { Head, usePage } from '@inertiajs/react';
import axios from 'axios';
import { MoreVertical, Check, CheckCheck, Users, Search, ArrowLeft, X } from 'lucide-react';
import { useEffect, useState, useRef, useMemo, memo, useCallback } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';

axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

interface User {
    id: number;
    name: string;
    unread_count?: number;
    has_conversation?: boolean;
    last_message_at?: string | null;
}

interface ReadReceipt {
    id: number;
    name: string;
    read_at: string;
}

interface Message {
    id: number;
    content: string;
    user: User;
    receiver_id: number | null;
    created_at: string;
    reads: ReadReceipt[];
}

interface ChatProps {
    operators: User[];
    generalUnreadCount: number;
}

// Sidebar Operator Item Component with Memo to prevent jitter
const OperatorItem = memo(({ 
    operator, 
    isSelected, 
    isOnline, 
    onClick 
}: { 
    operator: User; 
    isSelected: boolean; 
    isOnline: boolean; 
    onClick: () => void 
}) => {
    const formatTime = (dateString: string | null | undefined) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    };

    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center gap-3 p-3 border-b hover:bg-muted/50 transition-colors text-left ${isSelected ? 'bg-primary/10' : ''}`}
        >
            <div className="relative shrink-0">
                <Avatar className="h-11 w-11">
                    <AvatarFallback className="text-sm bg-secondary text-secondary-foreground">
                        {operator.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                </Avatar>
                {isOnline && (
                    <div className="absolute bottom-0.5 right-0.5 h-3 w-3 bg-green-500 border-2 border-background rounded-full shadow-sm"></div>
                )}
            </div>
            <div className="flex-1 min-w-0">
                <div className="font-medium flex justify-between items-center">
                    <span className="truncate">{operator.name}</span>
                    <span className="text-[10px] text-muted-foreground shrink-0 ml-2">
                        {formatTime(operator.last_message_at)}
                    </span>
                </div>
                <div className="h-4 flex items-center justify-between">
                    <p className={`text-xs truncate flex-1 ${isOnline ? 'text-primary font-semibold' : 'text-muted-foreground'}`}>
                        {isOnline ? 'onlayn' : 'oflayn'}
                    </p>
                    {(operator.unread_count || 0) > 0 && (
                        <span className="bg-primary text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center shrink-0 ml-1">
                            {operator.unread_count}
                        </span>
                    )}
                </div>
            </div>
        </button>
    );
});

OperatorItem.displayName = 'OperatorItem';

export default function Chat({ operators, generalUnreadCount }: ChatProps) {
    const { auth } = usePage<{ auth: { user: User } }>().props;
    const [messages, setMessages] = useState<Message[]>([]);
    const [selectedReceiverId, setSelectedReceiverId] = useState<number | null>(null);
    const [isGeneralChat, setIsGeneralChat] = useState(false);
    
    const [view, setView] = useState<'list' | 'chat'>('list');
    const [newMessage, setNewMessage] = useState('');
    const [processing, setProcessing] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    const [readByModalOpen, setReadByModalOpen] = useState(false);
    const [readByUsers, setReadByUsers] = useState<ReadReceipt[]>([]);

    const [operatorsState, setOperatorsState] = useState<User[]>(operators);
    const [generalUnread, setGeneralUnread] = useState<number>(generalUnreadCount);
    const [onlineUsers, setOnlineUsers] = useState<number[]>([]);
    
    const [userSearchTerm, setUserSearchTerm] = useState('');
    const [messageSearchTerm, setMessageSearchTerm] = useState('');
    const [isSearchingMessages, setIsSearchingMessages] = useState(false);

    const activeChatId = isGeneralChat ? 'general' : selectedReceiverId;

    const markAsRead = useCallback(async (messageId: number) => {
        try {
            await axios.post(`/chat/${messageId}/read`);
        } catch (error) {
            console.error('Failed to mark as read', error);
        }
    }, []);

    const markVisibleAsRead = useCallback((msgs: Message[]) => {
        msgs.forEach(msg => {
            if (msg.user.id !== auth.user.id) {
                const hasRead = msg.reads && msg.reads.some(r => r.id === auth.user.id);
                if (!hasRead) {
                    markAsRead(msg.id);
                }
            }
        });
    }, [auth.user.id, markAsRead]);

    const fetchMessages = useCallback(async (receiverId: number | null) => {
        try {
            const url = receiverId ? `/chat/messages/${receiverId}` : '/chat/messages';
            const response = await axios.get(url);
            setMessages(response.data);
            markVisibleAsRead(response.data);
        } catch (error) {
            console.error('Failed to fetch messages', error);
        }
    }, [markVisibleAsRead]);

    useEffect(() => {
        if (activeChatId !== undefined) {
            fetchMessages(selectedReceiverId);
            
            if (selectedReceiverId === null && isGeneralChat) {
                setGeneralUnread(0);
            } else if (selectedReceiverId !== null) {
                setOperatorsState(prev => prev.map(op => 
                    op.id === selectedReceiverId ? { ...op, unread_count: 0, has_conversation: true } : op
                ));
            }
        }
    }, [selectedReceiverId, isGeneralChat, activeChatId, fetchMessages]);

    const processedMessagesRef = useRef<Set<number>>(new Set());

    const handleIncomingMessage = useCallback((e: Message, relevantReceiverId: number | null) => {
        // Prevent double processing the same message
        if (processedMessagesRef.current.has(e.id)) return;
        processedMessagesRef.current.add(e.id);

        const isCurrentlyActive = (relevantReceiverId === null && isGeneralChat) || 
                                (relevantReceiverId !== null && selectedReceiverId === relevantReceiverId);

        if (isCurrentlyActive) {
            setMessages((prev) => {
                if (prev.find(m => m.id === e.id)) return prev;
                if (e.user.id !== auth.user.id) {
                    markAsRead(e.id);
                }
                return [...prev, e];
            });
        } else {
            // Only increment badge for incoming messages from others
            if (e.user.id !== auth.user.id) {
                if (relevantReceiverId === null) {
                    setGeneralUnread(u => u + 1);
                } else {
                    const senderId = e.user.id;
                    setOperatorsState(ops => {
                        const updated = ops.map(op => 
                            op.id === senderId ? { ...op, unread_count: (op.unread_count || 0) + 1, has_conversation: true, last_message_at: e.created_at } : op
                        );
                        return [...updated].sort((a, b) => {
                            const dateA = a.last_message_at ? new Date(a.last_message_at).getTime() : 0;
                            const dateB = b.last_message_at ? new Date(b.last_message_at).getTime() : 0;
                            return dateB - dateA;
                        });
                    });
                }
            }
        }
    }, [auth.user.id, isGeneralChat, selectedReceiverId, markAsRead]);

    const handleIncomingRead = useCallback((e: { id: number, reads: ReadReceipt[] }) => {
        setMessages((prev) => prev.map(msg => {
            if (msg.id === e.id) {
                return { ...msg, reads: e.reads };
            }
            return msg;
        }));
    }, []);

    useEffect(() => {
        window.Echo.join('chat')
            .here((users: User[]) => {
                setOnlineUsers(users.map(u => u.id));
            })
            .joining((user: User) => {
                setOnlineUsers(prev => [...new Set([...prev, user.id])]);
            })
            .leaving((user: User) => {
                setOnlineUsers(prev => prev.filter(id => id !== user.id));
            })
            .listen('.message.sent', (e: Message) => {
                if (e.receiver_id === null) {
                    handleIncomingMessage(e, null);
                }
            })
            .listen('.message.read', (e: { id: number, reads: ReadReceipt[], receiver_id: number | null }) => {
                if (e.receiver_id === null) {
                    handleIncomingRead(e);
                }
            });

        window.Echo.private(`chat.${auth.user.id}`)
            .listen('.message.sent', (e: Message) => {
                const relevantReceiver = e.user.id === auth.user.id ? e.receiver_id : e.user.id;
                handleIncomingMessage(e, relevantReceiver);
            })
            .listen('.message.read', (e: { id: number, reads: ReadReceipt[] }) => {
                handleIncomingRead(e);
            });

        return () => {
            window.Echo.leave('chat');
            window.Echo.leave(`chat.${auth.user.id}`);
        };
    }, [auth.user.id, handleIncomingMessage, handleIncomingRead]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        setProcessing(true);
        try {
            const response = await axios.post('/chat', {
                content: newMessage,
                receiver_id: selectedReceiverId,
            });
            
            const savedMessage = response.data;
            
            // Check if already processed by WebSocket
            if (!processedMessagesRef.current.has(savedMessage.id)) {
                processedMessagesRef.current.add(savedMessage.id);
                setMessages(prev => [...prev, savedMessage]);
            }
            
            setNewMessage('');
            
            if (selectedReceiverId) {
                setOperatorsState(prev => prev.map(op => 
                    op.id === selectedReceiverId ? { ...op, has_conversation: true, last_message_at: response.data.created_at } : op
                ));
            }
        } catch (error) {
            console.error('Error sending message', error);
        } finally {
            setProcessing(false);
        }
    };

    const openReadByModal = (reads: ReadReceipt[]) => {
        setReadByUsers(reads);
        setReadByModalOpen(true);
    };

    const selectChat = (id: number | null, general: boolean = false) => {
        setSelectedReceiverId(id);
        setIsGeneralChat(general);
        setView('chat');
    };

    const filteredOperators = useMemo(() => {
        return operatorsState.filter(op => {
            const matchesSearch = op.name.toLowerCase().includes(userSearchTerm.toLowerCase());
            if (userSearchTerm) return matchesSearch;
            return op.has_conversation;
        });
    }, [operatorsState, userSearchTerm]);

    const filteredMessages = useMemo(() => {
        if (!messageSearchTerm) return messages;
        return messages.filter(msg => 
            msg.content.toLowerCase().includes(messageSearchTerm.toLowerCase()) ||
            msg.user.name.toLowerCase().includes(messageSearchTerm.toLowerCase())
        );
    }, [messages, messageSearchTerm]);

    const getChatTitle = () => {
        if (isGeneralChat) return "Umumiy Chat";
        if (selectedReceiverId) {
            return operatorsState.find(o => o.id === selectedReceiverId)?.name || "Noma'lum";
        }
        return "Suhbatni tanlang";
    };

    const isOnline = (userId: number) => onlineUsers.includes(userId);

    const getLastSeenText = (userId: number | null) => {
        if (!userId) return '';
        if (isOnline(userId)) return 'onlayn';
        
        const operator = operatorsState.find(op => op.id === userId);
        if (!operator || !operator.last_message_at) return 'oflayn';
        
        const date = new Date(operator.last_message_at);
        const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
        return `oxirgi marta ${timeStr}da ko'rilgan`;
    };

    return (
        <AppLayout>
            <Head title="Chat" />

            <div className="flex h-[calc(100vh-4rem)] w-full overflow-hidden border-t">
                {/* Sidebar */}
                <div className={`${view === 'chat' ? 'hidden md:flex' : 'flex'} w-full md:w-80 flex-col border-r bg-muted/10 shrink-0`}>
                    <div className="p-4 border-b bg-background sticky top-0 z-10 h-16 flex items-center justify-between shadow-sm">
                        <span className="font-bold text-lg">Suhbatlar</span>
                    </div>
                    
                    <div className="p-3 bg-background/50">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input 
                                placeholder="Operatorlarni qidirish..." 
                                className="pl-9 bg-muted/50 border-0 h-10 shadow-none focus-visible:ring-1"
                                value={userSearchTerm}
                                onChange={(e) => setUserSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        <button
                            onClick={() => selectChat(null, true)}
                            className={`w-full flex items-center gap-3 p-3 border-b hover:bg-muted/50 transition-colors text-left ${isGeneralChat ? 'bg-primary/10' : ''}`}
                        >
                            <div className="bg-primary/20 p-2.5 rounded-full text-primary shrink-0">
                                <Users className="h-5 w-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <span className="font-medium flex justify-between items-center">
                                    <span>{t('chat.generalChat')}</span>
                                    {generalUnread > 0 && (
                                        <span className="bg-primary text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                                            {generalUnread}
                                        </span>
                                    )}
                                </div>
                                <p className="text-xs text-muted-foreground truncate">Barcha operatorlar guruhi</p>
                            </div>
                        </button>
                        
                        {filteredOperators.length === 0 && userSearchTerm && (
                            <div className="p-8 text-center text-sm text-muted-foreground">
                                Operator topilmadi
                            </div>
                        )}

                        {filteredOperators.map(operator => (
                            <OperatorItem 
                                key={operator.id}
                                operator={operator}
                                isSelected={selectedReceiverId === operator.id && !isGeneralChat}
                                isOnline={isOnline(operator.id)}
                                onClick={() => selectChat(operator.id)}
                            />
                        ))}
                    </div>
                </div>

                {/* Main Chat Area */}
                <div className={`${view === 'list' ? 'hidden md:flex' : 'flex'} flex-1 flex-col bg-background relative min-w-0`}>
                    {!isGeneralChat && selectedReceiverId === null && view === 'chat' ? (
                        <div className="flex-1 flex items-center justify-center text-muted-foreground">
                            Suhbatni tanlang
                        </div>
                    ) : (
                        <>
                            <div className="p-4 border-b font-semibold bg-background flex items-center gap-3 h-16 sticky top-0 z-10 shadow-sm shrink-0">
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="md:hidden -ml-2 h-9 w-9" 
                                    onClick={() => setView('list')}
                                >
                                    <ArrowLeft className="h-5 w-5" />
                                </Button>
                                
                                <div className="flex-1 flex items-center gap-3 min-w-0">
                                    {isGeneralChat ? (
                                        <Users className="h-5 w-5 text-muted-foreground shrink-0" />
                                    ) : (
                                        <div className="relative shrink-0">
                                            <Avatar className="h-9 w-9">
                                                <AvatarFallback className="text-xs bg-secondary text-secondary-foreground">
                                                    {getChatTitle().substring(0, 2).toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                            {selectedReceiverId && isOnline(selectedReceiverId) && (
                                                <div className="absolute bottom-0 right-0 h-2.5 w-2.5 bg-green-500 rounded-full border-2 border-background"></div>
                                            )}
                                        </div>
                                    )}
                                    
                                    {!isSearchingMessages ? (
                                        <div className="flex flex-col min-w-0 h-10 justify-center">
                                            <span className="truncate leading-tight font-bold">{getChatTitle()}</span>
                                            {!isGeneralChat && selectedReceiverId && (
                                                <span className={`text-[11px] leading-tight transition-colors duration-300 ${isOnline(selectedReceiverId) ? 'text-primary font-semibold' : 'text-muted-foreground'}`}>
                                                    {getLastSeenText(selectedReceiverId)}
                                                </span>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="flex-1 flex items-center gap-2">
                                            <input 
                                                autoFocus
                                                placeholder="Xabarlarni qidirish..." 
                                                className="w-full bg-muted/50 border-0 h-8 px-3 rounded-md focus:ring-1 focus:ring-primary outline-none text-sm"
                                                value={messageSearchTerm}
                                                onChange={(e) => setMessageSearchTerm(e.target.value)}
                                            />
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center gap-1">
                                    {isSearchingMessages ? (
                                        <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            className="h-8 w-8 shrink-0"
                                            onClick={() => {
                                                setIsSearchingMessages(false);
                                                setMessageSearchTerm('');
                                            }}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    ) : (
                                        <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            className="h-8 w-8"
                                            onClick={() => setIsSearchingMessages(true)}
                                        >
                                            <Search className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                            </div>
                            
                            <div 
                                ref={scrollRef}
                                className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 bg-muted/5 relative"
                            >
                                {filteredMessages.length === 0 ? (
                                    <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                                        {messageSearchTerm ? "Xabar topilmadi" : "Hozircha xabarlar yo'q..."}
                                    </div>
                                ) : null}

                                {filteredMessages.map((message) => {
                                    const isMine = message.user.id === auth.user.id;
                                    const isRead = message.reads && message.reads.length > 0;
                                    
                                    return (
                                        <div 
                                            key={`msg-${message.id}`}
                                            className={`flex ${isMine ? 'justify-end' : 'justify-start'} group`}
                                        >
                                            <div className={`flex max-w-[90%] sm:max-w-[70%] lg:max-w-[60%] ${isMine ? 'flex-row-reverse' : 'flex-row'} items-end gap-2 relative`}>
                                                <Avatar className="h-8 w-8 shrink-0">
                                                    <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                                                        {message.user.name.substring(0, 2).toUpperCase()}
                                                    </AvatarFallback>
                                                </Avatar>
                                                
                                                <div className={`px-4 py-2.5 rounded-2xl shadow-sm relative ${
                                                    isMine
                                                    ? 'bg-primary text-primary-foreground rounded-br-none' 
                                                    : 'bg-card border rounded-bl-none'
                                                }`}>
                                                    {!isMine && isGeneralChat && (
                                                        <div className="text-[11px] font-semibold mb-1 opacity-80 uppercase tracking-wider text-primary">{message.user.name}</div>
                                                    )}
                                                    <div className="text-[15px] leading-relaxed break-words whitespace-pre-wrap">{message.content}</div>
                                                    
                                                    <div className="flex items-center justify-end gap-1 mt-1 -mb-1">
                                                        <div className="text-[10px] opacity-70">
                                                            {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                                                        </div>
                                                        {isMine && (
                                                            <div className="text-[12px] opacity-90 ml-1">
                                                                {isRead ? (
                                                                    <CheckCheck className="h-[14px] w-[14px] text-blue-200" />
                                                                ) : (
                                                                    <Check className="h-[14px] w-[14px] opacity-70" />
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {isMine && (
                                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute top-1/2 -translate-y-1/2 -left-8">
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full bg-background/50 hover:bg-background/80 shadow-sm border">
                                                                    <MoreVertical className="h-4 w-4 text-muted-foreground" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end">
                                                                <DropdownMenuItem onClick={() => openReadByModal(message.reads || [])}>
                                                                    Kimlar o'qidi
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <form onSubmit={submit} className="p-4 border-t bg-background shrink-0 flex gap-3 items-end">
                                <Input
                                    placeholder="Xabar yozing..."
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    disabled={processing}
                                    className="bg-muted/50 border-0 h-auto py-3 px-4 shadow-none focus-visible:ring-1 text-[15px]"
                                    autoComplete="off"
                                />
                                <Button type="submit" size="lg" disabled={processing || !newMessage.trim()} className="rounded-full shrink-0 px-6">
                                    {processing ? '...' : 'Yuborish'}
                                </Button>
                            </form>
                        </>
                    )}
                </div>
            </div>

            <Dialog open={readByModalOpen} onOpenChange={setReadByModalOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>{t('chat.readBy')}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3 mt-4 max-h-[60vh] overflow-y-auto pr-2">
                        {readByUsers.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-6">Hali hech kim o'qimagan.</p>
                        ) : (
                            readByUsers.map(user => (
                                <div key={user.id} className="flex justify-between items-center border-b pb-3 last:border-0 last:pb-0">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-9 w-9">
                                            <AvatarFallback className="text-xs bg-secondary text-secondary-foreground">{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                                        </Avatar>
                                        <span className="text-[15px] font-medium">{user.name}</span>
                                    </div>
                                    <span className="text-[12px] text-muted-foreground">
                                        {new Date(user.read_at).toLocaleString([], { hour: '2-digit', minute: '2-digit', hour12: false, day: '2-digit', month: '2-digit', year: 'numeric' })}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
