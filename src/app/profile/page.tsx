
'use client';

import * as React from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { Loader2 } from 'lucide-react';
import type { UserProfile, AuthUser } from '@/types';
import { ProfileView } from '@/components/profile-view';
import { SidebarProvider } from '@/components/ui/sidebar';
import { TooltipProvider } from '@/components/ui/tooltip';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
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
            setProfile({ id: docSnapshot.id, ...docSnapshot.data() } as UserProfile);
          } else {
            router.replace('/create-account');
          }
          setLoading(false);
        }, (error) => {
          console.error("Profile snapshot error:", error);
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


  if (loading || !user) {
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
              <div className="container py-8">
                <ProfileView user={serializableUser} profile={profile} />
            </div>
        </SidebarProvider>
    </TooltipProvider>
  );
}
