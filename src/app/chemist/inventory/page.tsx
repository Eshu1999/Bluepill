
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { SidebarProvider } from '@/components/ui/sidebar';
import { TooltipProvider } from '@/components/ui/tooltip';
import { ChemistInventoryPageContent } from './chemist-inventory-page-content';
import { Loader2 } from 'lucide-react';
import { UserProfile, AuthUser } from '@/types';


export default function ChemistInventoryPage() {
    const [user, setUser] = React.useState<FirebaseUser | null>(null);
    const [profile, setProfile] = React.useState<UserProfile | null>(null);
    const [loading, setLoading] = React.useState(true);
    const router = useRouter();

    React.useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                const profileDocRef = doc(db, 'profiles', currentUser.uid);
                const unsubscribeProfile = onSnapshot(profileDocRef, (docSnapshot) => {
                    if (docSnapshot.exists()) {
                        const userProfile = { id: docSnapshot.id, ...docSnapshot.data() } as UserProfile;
                        if (userProfile.accountType === 'chemist') {
                            setProfile(userProfile);
                        } else {
                            router.replace('/mymedicine');
                        }
                    } else {
                        router.replace('/create-account');
                    }
                    setLoading(false);
                }, (error) => {
                    console.error("Error fetching profile:", error);
                    setLoading(false);
                    router.replace('/');
                });
                return () => unsubscribeProfile();
            } else {
                router.replace('/');
            }
        });
        return () => unsubscribeAuth();
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

    return (
        <TooltipProvider>
            <SidebarProvider>
                <ChemistInventoryPageContent user={serializableUser} profile={profile} />
            </SidebarProvider>
        </TooltipProvider>
    );
}
