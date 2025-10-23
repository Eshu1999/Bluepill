
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, onSnapshot } from 'firebase/firestore';
import { UserProfile, AuthUser } from '@/types';
import { FamilyPageContent } from './family-page-content';
import { TooltipProvider } from '@/components/ui/tooltip';
import { SidebarProvider } from '@/components/ui/sidebar';
import { Loader2 } from 'lucide-react';

export default function FamilyPage() {
    const [user, setUser] = React.useState<FirebaseUser | null>(null);
    const [profile, setProfile] = React.useState<UserProfile | null>(null);
    const [family, setFamily] = React.useState<UserProfile[]>([]);
    const [loading, setLoading] = React.useState(true);
    const router = useRouter();

    React.useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
            } else {
                setLoading(true); // Prevent rendering while redirecting
                router.replace('/');
            }
        });
        return () => unsubscribeAuth();
    }, [router]);

    React.useEffect(() => {
        if (!user) {
            setLoading(false);
            return;
        }

        const profileDocRef = doc(db, 'profiles', user.uid);
        const unsubscribeProfile = onSnapshot(profileDocRef, async (docSnapshot) => {
            if (docSnapshot.exists()) {
                const userProfile = { id: docSnapshot.id, ...docSnapshot.data() } as UserProfile;
                setProfile(userProfile);

                if (userProfile.family && userProfile.family.length > 0) {
                    const familyQuery = query(collection(db, 'profiles'), where('userId', 'in', userProfile.family));
                    const querySnapshot = await getDocs(familyQuery);
                    const profiles: UserProfile[] = [];
                    querySnapshot.forEach(doc => {
                        profiles.push({ id: doc.id, ...doc.data() } as UserProfile);
                    });
                    setFamily(profiles);
                } else {
                    setFamily([]);
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
    }, [user, router]);
    
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
                <FamilyPageContent
                    currentUser={serializableUser}
                    profile={profile}
                    family={family}
                />
            </SidebarProvider>
        </TooltipProvider>
    );
}
