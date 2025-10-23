
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { LifeBuoy, User, LogOut, Pill, Package, Settings, Menu, MessageSquare, PlusCircle, Loader2, UserPlus, Users, Heart, Bell, Home } from 'lucide-react';
import { auth, db } from '@/lib/firebase';
import { SidebarProvider, Sidebar, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarFooter, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import { TooltipProvider } from '@/components/ui/tooltip';
import { doc, onSnapshot } from 'firebase/firestore';
import { Chat, UserProfile } from '@/types';
import { ChatList } from '@/components/chat-list';
import { ChatView } from '@/components/chat-view';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { signOut, createOrGetChat } from '@/app/actions';
import type { AuthUser } from '@/types';


export const MessagesPageContent = ({ user, profile }: { user: AuthUser, profile: UserProfile | null }) => {
    const router = useRouter();
    const [selectedChat, setSelectedChat] = React.useState<Chat | null>(null);
    

    const handleSignOut = async () => {
        await auth.signOut();
        await signOut();
        router.replace('/');
    }
    
    const isChemist = profile?.accountType === 'chemist';

    const handleStartNewChat = async () => {
        // This is a placeholder. A proper implementation would open a user search dialog.
        // For now, we can't create new chats from the UI without the search dialog.
        // The logic for creating a chat is still in `actions.ts`.
        alert("Starting a new chat is not fully implemented yet. You can only view existing chats.");
    }


    return (
         <div className="flex min-h-screen w-full flex-col bg-background">
            <Sidebar>
                <SidebarContent>
                    <SidebarMenu>
                        <SidebarMenuItem>
                             <a href="/profile">
                                <SidebarMenuButton>
                                    <User /> 
                                    <span>Profile</span>
                                </SidebarMenuButton>
                            </a>
                             {isChemist ? (
                                <>
                                    <a href="/chemist/home">
                                        <SidebarMenuButton>
                                            <Home />
                                            <span>Home</span>
                                        </SidebarMenuButton>
                                    </a>
                                    <a href="/chemist/inventory">
                                        <SidebarMenuButton>
                                            <Package />
                                            <span>Inventory</span>
                                        </SidebarMenuButton>
                                    </a>
                                </>
                             ) : (
                                <>
                                     <a href="/mymedicine">
                                        <SidebarMenuButton>
                                            <Pill />
                                            <span>My Medication</span>
                                        </SidebarMenuButton>
                                    </a>
                                     <a href="/health-summary">
                                        <SidebarMenuButton>
                                            <Heart />
                                            <span>Health Summary</span>
                                        </SidebarMenuButton>
                                    </a>
                                    <a href="/medicine-storage">
                                        <SidebarMenuButton>
                                            <Package />
                                            <span>Medicine Storage</span>
                                        </SidebarMenuButton>
                                    </a>
                                </>
                             )}
                            <a href="/family">
                                <SidebarMenuButton>
                                    <Users />
                                    <span>Family</span>
                                </SidebarMenuButton>
                            </a>
                            <a href="/notifications">
                                <SidebarMenuButton>
                                    <Bell />
                                    <span>Notifications</span>
                                </SidebarMenuButton>
                            </a>
                            <a href="/messages">
                                <SidebarMenuButton isActive={true}>
                                    <MessageSquare />
                                    <span>Messages</span>
                                </SidebarMenuButton>
                            </a>
                             <a href="/settings">
                                <SidebarMenuButton>
                                    <Settings />
                                    <span>Settings</span>
                                </SidebarMenuButton>
                            </a>
                            <a href="/support">
                                <SidebarMenuButton>
                                    <LifeBuoy />
                                    <span>Support</span>
                                </SidebarMenuButton>
                            </a>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarContent>
                <SidebarFooter>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton onClick={handleSignOut}>
                               <LogOut /> 
                               <span>Sign Out</span>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarFooter>
            </Sidebar>
            <SidebarInset>
                 <header className="sticky top-0 z-40 w-full border-b bg-card">
                    <div className="container flex h-16 items-center justify-between">
                         <div className="md:hidden">
                           <SidebarTrigger>
                               <Menu />
                           </SidebarTrigger>
                         </div>
                         <div className={cn('hidden md:block')}></div>
                        <div className="flex items-center space-x-2">
                           <Button variant="outline" size="sm" onClick={handleStartNewChat}>
                                <PlusCircle className="mr-2 h-4 w-4"/>
                                New Chat
                           </Button>
                        </div>
                    </div>
                 </header>
                 <main className="flex-1 flex flex-col">
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4">
                        <div className="col-span-1 border-r flex-col flex">
                            <ChatList user={user} onSelectChat={setSelectedChat} selectedChatId={selectedChat?.id} />
                        </div>
                        <div className="col-span-1 md:col-span-2 xl:col-span-3 flex flex-col">
                            {selectedChat && profile ? (
                                <ChatView chat={selectedChat} currentUser={user} currentUserProfile={profile} />
                            ) : (
                                <div className="flex-1 flex items-center justify-center h-full">
                                    <div className="text-center">
                                        <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground" />
                                        <h3 className="mt-4 text-lg font-medium text-muted-foreground">Select a chat</h3>
                                        <p className="mt-1 text-sm text-muted-foreground">Or start a new conversation.</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            </SidebarInset>
        </div>
    );
};

    