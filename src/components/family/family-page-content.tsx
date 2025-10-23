
'use client';

import * as React from 'react';
import { ArrowLeft, Bell, Home, LogOut, Menu, MessageSquare, Pill, Package, Settings, User, UserPlus, Users, Heart, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { UserProfile } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Sidebar, SidebarContent, SidebarFooter, SidebarInset, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarTrigger } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import { sendFriendRequest } from '@/app/actions';
import { auth, db } from '@/lib/firebase';
import type { AuthUser } from '@/types';
import { Input } from '@/components/ui/input';
import { collection, getDocs, query, where, limit } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

const UserSearch = ({ currentUser }: { currentUser: AuthUser }) => {
    const [searchTerm, setSearchTerm] = React.useState('');
    const [results, setResults] = React.useState<UserProfile[]>([]);
    const [loading, setLoading] = React.useState(false);
    const [searched, setSearched] = React.useState(false);
    const { toast } = useToast();

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchTerm.trim()) return;

        setLoading(true);
        setSearched(true);
        try {
            const usersRef = collection(db, "profiles");
            const q = query(
                usersRef, 
                where("username", "==", searchTerm.toLowerCase()),
                where("accountType", "==", "normal"), // Only search for normal users
                limit(10)
            );
            const querySnapshot = await getDocs(q);
            const foundUsers: UserProfile[] = [];
            querySnapshot.forEach((doc) => {
                // Don't show the current user in search results
                if (doc.id !== currentUser.uid) {
                    foundUsers.push({ id: doc.id, ...doc.data() } as UserProfile);
                }
            });
            setResults(foundUsers);
        } catch (error) {
            console.error(error);
            toast({ variant: 'destructive', title: "Search Error", description: "Could not perform search." });
        } finally {
            setLoading(false);
        }
    };

    const handleSendRequest = async (userId: string) => {
        const firebaseUser = auth.currentUser;
        if (!firebaseUser) {
            toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in.' });
            return;
        }

        try {
            const idToken = await firebaseUser.getIdToken(true);
            const result = await sendFriendRequest(idToken, userId);
            if (result.success) {
                toast({ title: "Request Sent!", description: result.message });
            } else {
                throw new Error(result.error);
            }
        } catch(e: any) {
            toast({ variant: 'destructive', title: "Error", description: e.message });
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Add Family Member</CardTitle>
                <CardDescription>Search for a family member by their username to connect.</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSearch} className="flex items-center gap-2 mb-4">
                    <Input
                        placeholder="Enter user's username..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        type="text"
                    />
                    <Button type="submit" disabled={loading}>
                        {loading ? <Loader2 className="h-4 w-4 animate-spin"/> : <Search className="h-4 w-4"/>}
                    </Button>
                </form>
                <div className="space-y-2">
                    {loading && <p>Searching...</p>}
                    {!loading && searched && results.length === 0 && <p className="text-sm text-muted-foreground">No users found with that username.</p>}
                    {!loading && results.map(user => (
                        <div key={user.id} className="flex items-center justify-between p-2 rounded-md border">
                            <div className="flex items-center gap-3">
                                <Avatar>
                                    <AvatarImage src={user.pictureUrl} />
                                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-semibold">{user.name}</p>
                                    <p className="text-sm text-muted-foreground">@{user.username}</p>
                                </div>
                            </div>
                            <Button size="sm" onClick={() => handleSendRequest(user.id)}>
                                <UserPlus className="mr-2 h-4 w-4"/> Add
                            </Button>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}

export function FamilyPageContent({ currentUser, profile, family }: { currentUser: AuthUser, profile: UserProfile, family: UserProfile[] }) {
    const router = useRouter();

    const handleSignOut = async () => {
        await auth.signOut();
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
                    <p className="text-sm text-muted-foreground">No {title.toLowerCase()} found.</p>
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
                           {/* Action buttons can go here */}
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
                        {!isChemist && <UserSearch currentUser={currentUser} />}
                        <UserList title="Family Members" users={family} />
                    </div>
                </main>
            </SidebarInset>
        </div>
    );
};
