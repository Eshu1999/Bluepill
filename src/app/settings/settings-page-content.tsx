
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { auth, db } from '@/lib/firebase';
import { Loader2, ArrowLeft, Settings, User, LogOut, Pill, Package, Menu, Languages, BellRing, Vibrate, ChevronRight, Music, Upload, Mail, Phone, Edit, Save, LifeBuoy, MessageSquare, Heart, Bell, Users, Home, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SidebarProvider, Sidebar, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarFooter, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { signOut } from '@/app/actions';
import { UserProfile } from '@/types';
import { getUserProfile } from '../actions';
import type { AuthUser } from '@/types';

export const SettingsPageContent = ({ user, profile }: { user: AuthUser, profile: UserProfile }) => {
    const router = useRouter();
    const { toast } = useToast();

     const handleSignOut = async () => {
        await auth.signOut();
        await signOut();
        router.replace('/');
    }
    
    const isChemist = profile.accountType === 'chemist';

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
                                <SidebarMenuButton>
                                    <MessageSquare />
                                    <span>Messages</span>
                                </SidebarMenuButton>
                            </a>
                             <a href="/settings">
                                <SidebarMenuButton isActive={true}>
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
                        <div className="flex items-center mb-6">
                            <Button variant="ghost" size="icon" onClick={() => router.back()} className="mr-4">
                                <ArrowLeft />
                            </Button>
                            <h1 className="text-3xl font-bold tracking-tight font-headline">Settings</h1>
                        </div>
                        <div className="space-y-8">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Account</CardTitle>
                                    <CardDescription>Your account information from Google.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="email" className="flex items-center gap-3">
                                            <Mail className="h-5 w-5 text-muted-foreground" />
                                            <span>Email</span>
                                        </Label>
                                        <span className="text-sm text-muted-foreground">{user.email || 'Not provided'}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="phone" className="flex items-center gap-3">
                                            <Phone className="h-5 w-5 text-muted-foreground" />
                                            <span>Phone Number</span>
                                        </Label>
                                        <span className="text-sm text-muted-foreground">
                                            {user.phoneNumber || 'Not provided'}
                                        </span>
                                    </div>
                                </CardContent>
                            </Card>
                             <Card>
                                <CardHeader>
                                    <CardTitle>General</CardTitle>
                                    <CardDescription>Manage your general application settings.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="language" className="flex items-center gap-3 cursor-pointer">
                                            <Languages className="h-5 w-5 text-muted-foreground" />
                                            <span>Language</span>
                                        </Label>
                                        <Button variant="ghost" className="flex items-center gap-2 text-muted-foreground">
                                            <span>English</span>
                                            <ChevronRight className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader>
                                    <CardTitle>Log Out</CardTitle>
                                    <CardDescription>Sign out of your Bluepill account.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Button variant="destructive" onClick={handleSignOut}>
                                        <LogOut className="mr-2 h-4 w-4" />
                                        Log Out
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </main>
            </SidebarInset>
        </div>
    );
};
