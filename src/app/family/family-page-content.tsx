
'use client';

import * as React from 'react';
import { ArrowLeft, Bell, Home, LogOut, Menu, MessageSquare, Pill, Package, Settings, User, Users, Heart } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { UserProfile } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Sidebar, SidebarContent, SidebarFooter, SidebarInset, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarTrigger } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import { signOut } from '@/app/actions';
import { auth } from '@/lib/firebase';
import type { AuthUser } from '@/types';

export function FamilyPageContent({ currentUser, profile, family }: { currentUser: AuthUser, profile: UserProfile, family: UserProfile[] }) {
    const router = useRouter();

    const handleSignOut = async () => {
        await auth.signOut();
        await signOut();
        router.replace('/');
    }
    
    const isChemist = profile.accountType === 'chemist';

    const UserList = ({ title, users }: { title: string, users: UserProfile[]}) => (
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardContent>
                {users.length > 0 ? (
                    <div className="space-y-4">
                        {users.map(person => (
                             <a key={person.id} href={`/view-profile/${person.id}`} className="block">
                                <div className="flex items-center justify-between p-2 -m-2 rounded-md hover:bg-muted">
                                    <div className="flex items-center gap-3">
                                        <Avatar>
                                            <AvatarImage src={person.pictureUrl} />
                                            <AvatarFallback>{person.name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-semibold">{person.name}</p>
                                            <p className="text-sm text-muted-foreground">@{person.username}</p>
                                        </div>
                                    </div>
                                </div>
                            </a>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16 border-2 border-dashed rounded-lg">
                        <Users className="mx-auto h-12 w-12 text-muted-foreground" />
                        <h3 className="mt-4 text-lg font-medium text-muted-foreground">No family members yet</h3>
                        <p className="mt-1 text-sm text-muted-foreground">Scan a family member's QR code to connect.</p>
                        <Button className="mt-4" onClick={() => router.push('/scan')}>Scan Code</Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );

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
                             {!isChemist ? (
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
                             ) : (
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
                             )}
                            <a href="/family">
                                <SidebarMenuButton isActive={true}>
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
                                <SidebarMenuButton>
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
                           <Button onClick={() => router.push('/scan')}>Scan a QR Code</Button>
                        </div>
                    </div>
                 </header>
                 <main className="flex-1">
                    <div className="container py-8 space-y-8">
                         <div className="flex items-center">
                            <Button variant="ghost" size="icon" onClick={() => router.back()} className="mr-4">
                                <ArrowLeft />
                            </Button>
                            <h1 className="text-3xl font-bold tracking-tight font-headline">Family</h1>
                        </div>
                        <UserList title="Family Members" users={family} />
                    </div>
                </main>
            </SidebarInset>
        </div>
    );
};
