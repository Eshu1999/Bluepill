
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, LifeBuoy, User, LogOut, Pill, Package, Settings, Menu, MessageSquare, Heart, Bell, Users, Home } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { auth, db } from '@/lib/firebase';
import { Loader2 } from 'lucide-react';
import { SidebarProvider, Sidebar, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarFooter, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import { collection, onSnapshot, query, where, orderBy, Timestamp } from 'firebase/firestore';
import { AdherenceLog, UserProfile } from '@/types';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis, Tooltip as RechartsTooltip, Legend } from 'recharts';
import { format, subDays, startOfDay, compareDesc, isAfter } from 'date-fns';
import { signOut } from '@/app/actions';
import type { AuthUser } from '@/types';

export const HealthSummaryPageContent = ({ user, profile }: { user: AuthUser, profile: UserProfile }) => {
    const router = useRouter();
    const [logs, setLogs] = React.useState<AdherenceLog[]>([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        // Query only by userId to avoid composite indexes
        const logsQuery = query(
            collection(db, 'adherenceLogs'),
            where('userId', '==', user.uid)
        );

        const unsubscribe = onSnapshot(logsQuery, (snapshot) => {
            const sevenDaysAgo = startOfDay(subDays(new Date(), 6));
            const fetchedLogs: AdherenceLog[] = [];
            snapshot.forEach(doc => {
                 const data = doc.data();
                 // Firestore timestamps need to be converted to JS Dates
                 const loggedAtDate = (data.loggedAt as Timestamp)?.toDate ? (data.loggedAt as Timestamp).toDate() : new Date();

                 const log = {
                     id: doc.id,
                     ...data,
                     loggedAt: loggedAtDate
                 } as AdherenceLog;
                 
                 // Filter by date on the client
                 if (isAfter(new Date(log.loggedAt), sevenDaysAgo)) {
                    fetchedLogs.push(log);
                 }
            });
            // Sort on the client side
            fetchedLogs.sort((a, b) => compareDesc(new Date(a.loggedAt), new Date(b.loggedAt)));
            setLogs(fetchedLogs);
            setLoading(false);
        }, (error) => {
            console.error(error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user.uid]);

    const handleSignOut = async () => {
        await auth.signOut();
        await signOut();
        router.replace('/');
    }
    
    const chartData = React.useMemo(() => {
        const dataByDay: { [key: string]: { date: string; taken: number; skipped: number } } = {};
        for(let i=0; i<7; i++) {
            const date = startOfDay(subDays(new Date(), i));
            const formattedDate = format(date, 'MMM d');
            dataByDay[formattedDate] = { date: formattedDate, taken: 0, skipped: 0 };
        }

        logs.forEach(log => {
            const logDate = (log.loggedAt as any)?.toDate ? (log.loggedAt as any).toDate() : new Date(log.loggedAt);
            const formattedDate = format(logDate, 'MMM d');
            if(dataByDay[formattedDate]) {
                if(log.action === 'taken') {
                    dataByDay[formattedDate].taken++;
                } else {
                    dataByDay[formattedDate].skipped++;
                }
            }
        });
        
        return Object.values(dataByDay).reverse();

    }, [logs]);

    const overallAdherence = React.useMemo(() => {
        const total = logs.length;
        if (total === 0) return 0;
        const taken = logs.filter(l => l.action === 'taken').length;
        return Math.round((taken / total) * 100);
    }, [logs]);

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
                                        <SidebarMenuButton isActive={true}>
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
                            <h1 className="text-3xl font-bold tracking-tight font-headline">Health Summary</h1>
                        </div>
                        {loading ? (
                             <div className="flex justify-center items-center h-64">
                                <Loader2 className="h-8 w-8 animate-spin" />
                            </div>
                        ) : (
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                             <Card className="lg:col-span-2">
                                <CardHeader>
                                    <CardTitle>7-Day Adherence Report</CardTitle>
                                    <CardDescription>Doses taken vs. skipped over the last week.</CardDescription>
                                </CardHeader>
                                <CardContent className="h-[300px] w-full">
                                    <ResponsiveContainer>
                                        <BarChart data={chartData}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="date" />
                                            <YAxis allowDecimals={false}/>
                                            <RechartsTooltip />
                                            <Legend />
                                            <Bar dataKey="taken" fill="hsl(var(--primary))" name="Taken" radius={[4, 4, 0, 0]} />
                                            <Bar dataKey="skipped" fill="hsl(var(--destructive))" name="Skipped" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>
                             <Card>
                                <CardHeader>
                                    <CardTitle>Overall Adherence</CardTitle>
                                    <CardDescription>Your overall dose history.</CardDescription>
                                </CardHeader>
                                <CardContent className="flex flex-col items-center justify-center h-[300px]">
                                    <div className="relative h-40 w-40">
                                        <svg className="h-full w-full" viewBox="0 0 36 36">
                                            <path
                                                d="M18 2.0845
                                                a 15.9155 15.9155 0 0 1 0 31.831
                                                a 15.9155 15.9155 0 0 1 0 -31.831"
                                                className="stroke-current text-muted"
                                                fill="none"
                                                strokeWidth="3"
                                            />
                                            <path
                                                d="M18 2.0845
                                                a 15.9155 15.9155 0 0 1 0 31.831
                                                a 15.9155 15.9155 0 0 1 0 -31.831"
                                                className="stroke-current text-primary"
                                                fill="none"
                                                strokeWidth="3"
                                                strokeDasharray={`${overallAdherence}, 100`}
                                                strokeLinecap='round'
                                            />
                                        </svg>
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <span className="text-4xl font-bold">{overallAdherence}%</span>
                                        </div>
                                    </div>
                                     <p className="mt-4 text-center text-muted-foreground">
                                        {logs.length > 0 ? `Based on ${logs.length} logged doses.` : 'No doses logged yet.'}
                                    </p>
                                </CardContent>
                            </Card>
                        </div>
                        )}
                    </div>
                </main>
            </SidebarInset>
        </div>
    );
};

    