
'use client';

import * as React from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { auth, db } from '@/lib/firebase';
import { Loader2 } from 'lucide-react';
import Dashboard from '@/components/dashboard';
import { doc, onSnapshot } from 'firebase/firestore';
import { UserProfile, AuthUser } from '@/types';

export default function ChemistHomePage() {
  const [user, setUser] = React.useState<FirebaseUser | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [profile, setProfile] = React.useState<UserProfile | null>(null);
  const router = useRouter();

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        const profileDocRef = doc(db, 'profiles', currentUser.uid);
        const unsubProfile = onSnapshot(profileDocRef, (docSnap) => {
          if (docSnap.exists()) {
            const userProfile = { id: docSnap.id, ...docSnap.data() } as UserProfile;
            if (userProfile.accountType === 'chemist') {
              setProfile(userProfile);
              setLoading(false);
            } else {
              // Not a chemist, redirect
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
  }

  return <Dashboard user={serializableUser} />;
}
