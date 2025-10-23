
'use client';

import * as React from 'react';
import { collection, onSnapshot, query, where, doc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import type { Medication, UserProfile } from '@/types';
import {
  Menu,
  User,
  LogOut,
  Home as HomeIcon,
  Package,
  Pill,
  QrCode,
  MessageSquare,
  Settings,
  LifeBuoy,
  Heart,
  Bell,
  Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/logo';
import { cn } from '@/lib/utils';
import { ProfileView } from '@/components/profile-view';
import { HomeView } from './home-view';
import { InventoryView } from './inventory-view';
import { ScannerView } from './scanner-view';
import {
  TooltipProvider,
} from '@/components/ui/tooltip';
import { 
    SidebarProvider, 
    Sidebar, 
    SidebarHeader, 
    SidebarTrigger, 
    SidebarContent, 
    SidebarMenu, 
    SidebarMenuItem, 
    SidebarMenuButton,
    SidebarFooter,
    SidebarInset,
} from './ui/sidebar';
import { useRouter } from 'next/navigation';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { ChemistRequestList } from './chemist-request-list';
import { signOut } from '@/app/actions';
import type { AuthUser } from '@/types';


type ActiveView = 'home' | 'inventory' | 'scanner';

interface DashboardProps {
    user: AuthUser;
}

const MainDashboard = ({ user }: DashboardProps) => {
  const [profile, setProfile] = React.useState<UserProfile | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [activeView, setActiveView] = React.useState<ActiveView>('home');
  const router = useRouter();
 
  React.useEffect(() => {
    if (user) {
      const profileDocRef = doc(db, 'profiles', user.uid);
      const unsubscribeProfile = onSnapshot(profileDocRef, (docSnapshot) => {
          if (docSnapshot.exists()) {
              const userProfile = { id: docSnapshot.id, ...docSnapshot.data() } as UserProfile;
              setProfile(userProfile);
              setLoading(false);
          } else {
              setProfile(null);
              setLoading(false);
          }
      }, (error) => {
          console.error("Profile snapshot error:", error);
          setLoading(false);
      });

      return () => {
        unsubscribeProfile();
      }
    } else {
      setLoading(false);
      setProfile(null);
    }
  }, [user]);

  const handleSignOut = async () => {
      await auth.signOut();
      await signOut();
      router.replace('/');
  }

  const renderContent = () => {
    if (loading) {
        return <p>Loading profile...</p>
    }
    
    // The content is now rendered by individual pages.
    // This component will just render the shell.
    // We'll keep HomeView as the default for the main page.
     return <HomeView profile={profile} setActiveView={setActiveView} user={user}/>;
  }


  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Sidebar>
          <SidebarContent>
              <SidebarMenu>
                  <SidebarMenuItem>
                      {profile?.accountType === 'chemist' && (
                           <>
                            <a href="/profile">
                                <SidebarMenuButton>
                                    <User /> 
                                    <span>Profile</span>
                                </SidebarMenuButton>
                            </a>
                            <a href="/chemist/home">
                                <SidebarMenuButton>
                                    <HomeIcon />
                                    <span>Home</span>
                                </SidebarMenuButton>
                            </a>
                             <a href="/chemist/inventory">
                                <SidebarMenuButton>
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
                            <a href="/support">
                                <SidebarMenuButton>
                                    <LifeBuoy />
                                    <span>Support</span>
                                </SidebarMenuButton>
                            </a>
                          </>
                      )}
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
                        <ChemistRequestList user={user} />
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
              {renderContent()}
            </div>
          </main>
      </SidebarInset>
    </div>
  );
}


export default function Dashboard({ user }: DashboardProps) {
    return (
        <TooltipProvider>
            <SidebarProvider>
                <MainDashboard user={user} />
            </SidebarProvider>
        </TooltipProvider>
    )
}

    