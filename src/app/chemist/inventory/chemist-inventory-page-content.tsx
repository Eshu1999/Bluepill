
'use client';

import * as React from 'react';
import { ArrowLeft, Settings, User, LogOut, Pill, Package, Menu, MessageSquare, Heart, Bell, Home, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SidebarProvider, Sidebar, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarFooter, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { InventoryView } from '@/components/inventory-view';
import { signOut } from '@/app/actions';
import { auth } from '@/lib/firebase';
import type { AuthUser, UserProfile } from '@/types';

export const ChemistInventoryPageContent = ({ user, profile }: { user: AuthUser, profile: UserProfile }) => {
    const router = useRouter();

     const handleSignOut = async () => {
        await auth.signOut();
        await signOut();
        router.replace('/');
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
                             <a href="/chemist/home">
                                <SidebarMenuButton>
                                    <Home />
                                    <span>Home</span>
                                </SidebarMenuButton>
                            </a>
                            <a href="/chemist/inventory">
                                <SidebarMenuButton isActive={true}>
                                    <Package />
                                    <span>Inventory</span>
                                </SidebarMenuButton>
                            </a>
                             <a href="/family">
                                <SidebarMenuButton>
                                    <Users />
                                    <span>Family</span>
                                </SidebarMenuButton>
                            </a>
                             <a href="/messages">
                                <SidebarMenuButton>
                                    <MessageSquare />
                                    <span>Messages</span>
                                </SidebarMenuButton>
                            </a>
                             <a href="/notifications">
                                <SidebarMenuButton>
                                    <Bell />
                                    <span>Notifications</span>
                                </SidebarMenuButton>
                            </a>
                             <a href="/settings">
                                <SidebarMenuButton>
                                    <Settings />
                                    <span>Settings</span>
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
                           {/* Action buttons can go here */}
                        </div>
                    </div>
                 </header>
                 <main className="flex-1">
                    <div className="container py-8">
                        <InventoryView user={user} />
                    </div>
                </main>
            </SidebarInset>
        </div>
    );
};

    