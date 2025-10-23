
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { UserProfile, AuthUser } from '@/types';
import { Loader2 } from 'lucide-react';
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
import { TooltipProvider } from '@/components/ui/tooltip';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ChemistRequestList } from '@/components/chemist-request-list';
import { signOut } from '@/app/actions';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';

const DoctorHomePageContent = ({ user, profile }: { user: AuthUser, profile: UserProfile }) => {
  const router = useRouter();

  const handleSignOut = async () => {
    await auth.signOut();
    await signOut();
    router.replace('/');
  };

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

  return (
    <TooltipProvider>
      <SidebarProvider>
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
                                <SidebarMenuButton isActive={true}>
                                    <HomeIcon />
                                    <span>Home</span>
                                </SidebarMenuButton>
                            </a>
                             <a href="/doctor/inventory">
                                <SidebarMenuButton>
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
                      <div className='md:hidden'>
                          <SidebarTrigger>
                              <Menu />
                          </SidebarTrigger>
                      </div>
                  <div className={cn('hidden md:block')}></div>

                  <div className="flex items-center space-x-2">
                     <Popover>
                        <PopoverTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <Bell />
                            <span className="sr-only">Notifications</span>
                        </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-96" align="end">
                           {/* Placeholder for doctor-specific notifications */}
                           <p>No notifications yet.</p>
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
              <main className="flex-1">
                <div className="container py-8">
                  <div className="space-y-8">
                     <div>
                        <h1 className="text-3xl font-bold tracking-tight font-headline mb-2">Welcome, Dr. {profile.name.split(' ')[0]}</h1>
                        <p className="text-muted-foreground">Here's a summary of your activities.</p>
                     </div>
                      <div className="grid gap-6 md:grid-cols-2">
                            <QuickAccessCard 
                                title="View Patients"
                                description="Manage your connected patients"
                                icon={<Users className="h-6 w-6 text-primary" />}
                                onClick={() => router.push('/family')}
                            />
                            <QuickAccessCard 
                                title="Manage Inventory"
                                description="Update your sample stock"
                                icon={<Package className="h-6 w-6 text-primary" />}
                                onClick={() => router.push('/doctor/inventory')}
                            />
                      </div>
                      <div>
                          <h2 className="text-2xl font-bold tracking-tight font-headline mb-4">Medication Requests</h2>
                          <ChemistRequestList user={user} />
                      </div>
                  </div>
                </div>
              </main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </TooltipProvider>
  );
};

export default function DoctorHomePage() {
  const [user, setUser] = React.useState<FirebaseUser | null>(null);
  const [profile, setProfile] = React.useState<UserProfile | null>(null);
  const [loading, setLoading] = React.useState(true);
  const router = useRouter();

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        const profileDocRef = doc(db, 'profiles', currentUser.uid);
        const unsubProfile = onSnapshot(profileDocRef, (docSnap) => {
          if (docSnap.exists()) {
            const userProfile = { id: docSnap.id, ...docSnap.data() } as UserProfile;
            if (userProfile.accountType === 'doctor') {
              setProfile(userProfile);
              setLoading(false);
            } else {
              // Not a doctor, redirect to normal user page
              router.replace('/mymedicine');
            }
          } else {
            // No profile, redirect to create one
            router.replace('/create-account');
          }
        }, (error) => {
            console.error("Error fetching profile:", error);
            setLoading(false);
            router.replace('/');
        });
        return () => unsubProfile();
      } else {
        router.replace('/');
      }
    });

    return () => unsubscribe();
  }, [router]);

  if (loading || !user || !profile) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const serializableUser: AuthUser = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      phoneNumber: user.phoneNumber,
  };

  return <DoctorHomePageContent user={serializableUser} profile={profile} />;
}
