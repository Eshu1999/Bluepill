
'use client';

import * as React from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { Loader2, ChevronDown, Bug, Server } from 'lucide-react';
import { MedicationsView } from '@/components/medications-view';
import { SidebarProvider, Sidebar, SidebarHeader, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarFooter, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { User, LogOut, Pill, Menu, Package, Settings, LifeBuoy, ArrowRight, MessageSquare, Heart, Users, Bell, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TooltipProvider } from '@/components/ui/tooltip';
import { doc, onSnapshot, collection, query, where, getDocs } from 'firebase/firestore';
import { UserProfile } from '@/types';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { FriendRequestList } from '@/components/friend-request-list';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { signOut } from '@/app/actions';
import type { AuthUser } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';


export const MyMedicinePageContent = ({ user, profile, familyProfiles }: { user: AuthUser, profile: UserProfile, familyProfiles: UserProfile[] }) => {
    const [viewingProfile, setViewingProfile] = React.useState<UserProfile>(profile);
    const router = useRouter();
    const { toast } = useToast();

    const handleSignOut = async () => {
        await auth.signOut(); // Signs out from Firebase client auth
        await signOut(); // Clears the session cookie via server action
        // The onAuthStateChanged listener will handle the redirect
    }
    
    const isChemist = profile.accountType === 'chemist';
    
      const QuickAccessCard = ({ title, description, icon, onClick, className }: { title: string, description?: string, icon: React.ReactNode, onClick: () => void, className?: string }) => (
        <Card className={cn("hover:shadow-md transition-shadow cursor-pointer", className)} onClick={onClick}>
            <CardHeader>
                <div className="flex items-center justify-between">
                     <div className="flex items-center gap-3">
                        {icon}
                        <div>
                            <CardTitle>{title}</CardTitle>
                            {description && <CardDescription className="mt-1">{description}</CardDescription>}
                        </div>
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground self-start" />
                </div>
            </CardHeader>
        </Card>
      );
      
    const getFirstName = (fullName: string) => {
        return fullName ? fullName.split(' ')[0] : '';
    }
      
    return (
         <div className="flex min-h-screen w-full flex-col bg-background">
            <Sidebar>
                <SidebarHeader>
                </SidebarHeader>
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
                                        <SidebarMenuButton isActive={true}>
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
                 <header className="sticky top-0 z-30 w-full border-b bg-card">
                    <div className="container flex h-16 items-center justify-between">
                         <div className="md:hidden">
                           <SidebarTrigger>
                               <Menu />
                           </SidebarTrigger>
                         </div>
                        
                        <div className="flex items-center gap-4">
                           <DropdownMenu>
                               <DropdownMenuTrigger asChild>
                                   <Button variant="ghost" className="text-base font-bold flex items-center gap-2">
                                       <Avatar className="h-7 w-7">
                                           <AvatarImage src={viewingProfile.pictureUrl} />
                                           <AvatarFallback>{viewingProfile.name.charAt(0)}</AvatarFallback>
                                       </Avatar>
                                       <span>{getFirstName(viewingProfile.name)}</span>
                                       <ChevronDown className="h-4 w-4" />
                                   </Button>
                               </DropdownMenuTrigger>
                               <DropdownMenuContent align="start">
                                   <DropdownMenuItem onClick={() => setViewingProfile(profile)}>
                                       <User className="mr-2 h-4 w-4" />
                                       My Medications
                                   </DropdownMenuItem>
                                   {familyProfiles.map(p => (
                                        <DropdownMenuItem key={p.id} onClick={() => setViewingProfile(p)}>
                                            <Avatar className="h-6 w-6 mr-2">
                                                <AvatarImage src={p.pictureUrl} />
                                                <AvatarFallback>{p.name.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            {getFirstName(p.name)}
                                        </DropdownMenuItem>
                                   ))}
                               </DropdownMenuContent>
                           </DropdownMenu>
                        </div>

                        <div className="flex items-center space-x-2">
                            <Popover>
                                <PopoverTrigger asChild>
                                <Button variant="ghost" size="icon">
                                    <Bell />
                                    <span className="sr-only">Notifications</span>
                                </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-96" align="end">
                                    <FriendRequestList user={user} />
                                </PopoverContent>
                            </Popover>
                             <a href="/messages">
                                <Button variant="ghost" size="icon">
                                    <MessageSquare />
                                    <span className="sr-only">Messages</span>
                                </Button>
                            </a>
                        </div>
                    </div>
                 </header>
                 <main className="flex-1 pb-8">
                    <div className="container py-8 space-y-8">
                        
                        <div>
                            <MedicationsView user={user} profile={profile} viewingProfile={viewingProfile} />
                        </div>
                         {user.uid === viewingProfile.userId && (
                            <div className="space-y-8">
                                <div className="grid gap-6 md:grid-cols-2">
                                    <QuickAccessCard 
                                        title="View My Storage"
                                        description="Manage your medicine stock"
                                        icon={<Package className="h-6 w-6 text-primary" />}
                                        onClick={() => router.push('/medicine-storage')}
                                    />
                                    <QuickAccessCard 
                                        title="View Health Summary"
                                        description="See your adherence report"
                                        icon={<Heart className="h-6 w-6 text-primary" />}
                                        onClick={() => router.push('/health-summary')}
                                    />
                                </div>
                            </div>
                         )}
                    </div>
                </main>
            </SidebarInset>
        </div>
    )
}
