
'use client';

import * as React from 'react';
import {
  Menu,
  User,
  LogOut,
  Home as HomeIcon,
  Package,
  Bell,
  Users,
  MessageSquare,
  Settings,
  LifeBuoy
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { 
    SidebarProvider, 
    Sidebar, 
    SidebarTrigger, 
    SidebarContent, 
    SidebarMenu, 
    SidebarMenuItem, 
    SidebarMenuButton,
    SidebarFooter,
    SidebarInset,
} from '@/components/ui/sidebar';
import { useRouter } from 'next/navigation';
import { InventoryView } from '@/components/inventory-view';
import { signOut } from '@/app/actions';
import { auth } from '@/lib/firebase';
import type { AuthUser, UserProfile } from '@/types';

export const DoctorInventoryPageContent = ({ user, profile }: { user: AuthUser, profile: UserProfile }) => {
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
                             <a href="/doctor/home">
                                <SidebarMenuButton>
                                    <HomeIcon />
                                    <span>Home</span>
                                </SidebarMenuButton>
                            </a>
                            <a href="/doctor/inventory">
                                <SidebarMenuButton isActive={true}>
                                    <Package />
                                    <span>Inventory</span>
                                </SidebarMenuButton>
                            </a>
                             <a href="/family">
                                <SidebarMenuButton>
                                    <Users />
                                    <span>Patients</span>
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
