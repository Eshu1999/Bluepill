
'use client';

import * as React from 'react';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Chat } from '@/types';
import { Loader2, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import type { AuthUser } from '@/types';

interface ChatListProps {
  user: AuthUser;
  onSelectChat: (chat: Chat) => void;
  selectedChatId?: string | null;
}

export function ChatList({ user, onSelectChat, selectedChatId }: ChatListProps) {
  const [chats, setChats] = React.useState<Chat[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (!user) return;

    const q = query(
        collection(db, 'chats'), 
        where('members', 'array-contains', user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const chatData: Chat[] = [];
      snapshot.forEach(doc => {
        chatData.push({ id: doc.id, ...doc.data() } as Chat);
      });
      // Sort on the client-side to avoid needing a composite index
      chatData.sort((a, b) => new Date(b.lastUpdatedAt).getTime() - new Date(a.lastUpdatedAt).getTime());
      setChats(chatData);
      setLoading(false);
    }, (error) => {
        console.error("Error fetching chats: ", error);
        setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  if (loading) {
    return <div className="flex-1 flex items-center justify-center"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  }
  
  const getOtherMember = (chat: Chat) => {
      return chat.memberDetails.find(m => m.id !== user.uid);
  }

  return (
    <div className="flex-1 overflow-y-auto">
        {chats.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
                No conversations yet. Start a new chat!
            </div>
        ) : (
            <div className="flex flex-col">
                {chats.map(chat => {
                    const otherMember = getOtherMember(chat);
                    return (
                        <button
                            key={chat.id}
                            onClick={() => onSelectChat(chat)}
                            className={cn(
                                "flex items-center gap-4 p-4 text-left w-full hover:bg-muted/50",
                                selectedChatId === chat.id && "bg-muted"
                            )}
                        >
                            <Avatar>
                                <AvatarImage src={otherMember?.pictureUrl} />
                                <AvatarFallback><User /></AvatarFallback>
                            </Avatar>
                            <div className="flex-1 truncate">
                                <p className="font-semibold truncate">{otherMember?.name || 'Unknown User'}</p>
                                <p className="text-sm text-muted-foreground truncate">
                                    {chat.lastMessage?.text || 'No messages yet'}
                                </p>
                            </div>
                            <time className="text-xs text-muted-foreground self-start">
                                {chat.lastUpdatedAt && formatDistanceToNow(new Date(chat.lastUpdatedAt), { addSuffix: true })}
                            </time>
                        </button>
                    )
                })}
            </div>
        )}
    </div>
  );
}
