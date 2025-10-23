
'use client';

import * as React from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { Loader2 } from 'lucide-react';
import { MyMedicinePageContent } from './mymedicine-page-content';
import { SidebarProvider } from '@/components/ui/sidebar';
import { TooltipProvider } from '@/components/ui/tooltip';
import { doc, onSnapshot, collection, query, where, getDocs } from 'firebase/firestore';
import { UserProfile } from '@/types';
import { useRouter } from 'next/navigation';

export default function MyMedicinePage() {
  const [user, setUser] = React.useState<FirebaseUser | null>(null);
  const [profile, setProfile] = React.useState<UserProfile | null>(null);
  const [familyProfiles, setFamilyProfiles] = React.useState<UserProfile[]>([]);
  const [loading, setLoading] = React.useState(true);
  const router = useRouter();

  React.useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        router.replace('/');
      }
    });

    return () => unsubscribeAuth();
  }, [router]);

  React.useEffect(() => {
    if (!user) {
      // Don't start loading profile if user isn't authenticated yet
      return;
    }
    
    setLoading(true);
    const profileDocRef = doc(db, 'profiles', user.uid);
    const unsubscribeProfile = onSnapshot(profileDocRef, async (docSnapshot) => {
      if (docSnapshot.exists()) {
        const userProfile = { id: docSnapshot.id, ...docSnapshot.data() } as UserProfile;
        setProfile(userProfile);
        
        if (userProfile.accountType === 'chemist') {
          router.replace('/chemist/home');
          return;
        }

        // Fetch family profiles
        if (userProfile.family && userProfile.family.length > 0) {
          const familyQuery = query(collection(db, 'profiles'), where('userId', 'in', userProfile.family));
          const querySnapshot = await getDocs(familyQuery);
          const profiles: UserProfile[] = [];
          querySnapshot.forEach(doc => {
              profiles.push({ id: doc.id, ...doc.data() } as UserProfile);
          });
          setFamilyProfiles(profiles);
        } else {
          setFamilyProfiles([]);
        }

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
  }, [user, router]);


  if (loading || !user || !profile) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }
  
    const serializableUser = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      phoneNumber: user.phoneNumber,
  }

  return (
      <TooltipProvider>
          <SidebarProvider>
              <MyMedicinePageContent user={serializableUser} profile={profile} familyProfiles={familyProfiles} />
          </SidebarProvider>
      </TooltipProvider>
  );
}
