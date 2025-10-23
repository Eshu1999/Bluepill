
'use client';

import * as React from 'react';
import { Chat, Message, UserProfile } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { User, Send, Loader2 } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, doc, setDoc, Timestamp, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import type { AuthUser } from '@/types';

interface ChatViewProps {
  chat: Chat;
  currentUser: AuthUser;
  currentUserProfile: UserProfile;
}

export function ChatView({ chat, currentUser, currentUserProfile }: ChatViewProps) {
    const [messages, setMessages] = React.useState<Message[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [newMessage, setNewMessage] = React.useState('');
    const messagesEndRef = React.useRef<HTMLDivElement>(null);
    const otherMember = chat.memberDetails.find(m => m.id !== currentUser.uid);

    React.useEffect(() => {
        const messagesRef = collection(db, 'chats', chat.id, 'messages');
        const q = query(messagesRef, orderBy('timestamp', 'asc'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const msgs: Message[] = [];
            snapshot.forEach(doc => {
                const data = doc.data();
                msgs.push({ 
                    id: doc.id,
                    ...data,
                    timestamp: (data.timestamp as Timestamp).toDate(),
                } as Message);
            });
            setMessages(msgs);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [chat.id]);

    React.useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        const text = newMessage.trim();
        if (!text) return;

        const messagesRef = collection(db, 'chats', chat.id, 'messages');
        const chatRef = doc(db, 'chats', chat.id);

        try {
            setNewMessage('');
            const messageData = {
                senderId: currentUser.uid,
                text: text,
                timestamp: serverTimestamp(),
                isRead: false
            };
            
            await addDoc(messagesRef, messageData);
            
            // Update the last message on the chat document
            await updateDoc(chatRef, {
                lastMessage: {
                    senderId: currentUser.uid,
                    text: text,
                    isRead: false
                },
                lastUpdatedAt: new Date().toISOString()
            });

        } catch (error) {
            console.error("Error sending message: ", error);
            // Optionally reset the input field if sending failed
            setNewMessage(text);
        }
    };
    
    return (
        <div className="flex-1 flex flex-col h-full">
            {/* Header */}
            <div className="p-4 border-b flex items-center gap-4">
                <Avatar>
                    <AvatarImage src={otherMember?.pictureUrl} />
                    <AvatarFallback><User /></AvatarFallback>
                </Avatar>
                <div>
                    <p className="font-bold">{otherMember?.name || 'Unknown User'}</p>
                    <p className="text-xs text-muted-foreground">Online</p>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/30">
                {loading ? (
                    <div className="flex justify-center items-center h-full">
                        <Loader2 className="h-8 w-8 animate-spin" />
                    </div>
                ) : (
                    messages.map((msg, index) => {
                        const isCurrentUser = msg.senderId === currentUser.uid;
                        const senderDetails = chat.memberDetails.find(m => m.id === msg.senderId);
                        const showDateSeparator = index === 0 || 
                            new Date(msg.timestamp).toDateString() !== new Date(messages[index-1].timestamp).toDateString();
                        
                        return (
                            <React.Fragment key={msg.id}>
                                {showDateSeparator && (
                                    <div className="text-center text-xs text-muted-foreground my-4">
                                        {format(new Date(msg.timestamp), 'eeee, MMMM d')}
                                    </div>
                                )}
                                <div className={cn(
                                    'flex items-end gap-2',
                                    isCurrentUser ? 'justify-end' : 'justify-start'
                                )}>
                                    {!isCurrentUser && (
                                        <Avatar className="h-6 w-6">
                                            <AvatarImage src={senderDetails?.pictureUrl} />
                                            <AvatarFallback className="text-xs"><User /></AvatarFallback>
                                        </Avatar>
                                    )}
                                    <div className={cn(
                                        'p-3 rounded-lg max-w-xs md:max-w-md lg:max-w-lg',
                                        isCurrentUser ? 'bg-primary text-primary-foreground rounded-br-none' : 'bg-card text-card-foreground rounded-bl-none'
                                    )}>
                                        <p className="text-sm">{msg.text}</p>
                                        <p className="text-xs text-right mt-1 opacity-70">{format(new Date(msg.timestamp), 'p')}</p>
                                    </div>
                                    {isCurrentUser && (
                                        <Avatar className="h-6 w-6">
                                            <AvatarImage src={currentUserProfile.pictureUrl} />
                                            <AvatarFallback className="text-xs"><User /></AvatarFallback>
                                        </Avatar>
                                    )}
                                </div>
                            </React.Fragment>
                        );
                    })
                )}
                 <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <div className="p-4 border-t">
                <form onSubmit={handleSendMessage} className="flex gap-2">
                    <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1"
                        autoComplete="off"
                    />
                    <Button type="submit" size="icon" disabled={!newMessage.trim()}>
                        <Send />
                    </Button>
                </form>
            </div>
        </div>
    );
}
