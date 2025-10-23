
'use client';

import * as React from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { usePathname, useRouter } from 'next/navigation';
import { UserProfile, AuthUser } from '@/types';
import { Loader2 } from 'lucide-react';

interface AuthContextType {
  user: FirebaseUser | null;
  profile: UserProfile | null;
  loading: boolean;
  serializableUser: AuthUser | null;
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

const PUBLIC_ROUTES = ['/', '/login', '/create-account', '/admin/login'];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<FirebaseUser | null>(null);
  const [profile, setProfile] = React.useState<UserProfile | null>(null);
  const [loading, setLoading] = React.useState(true);
  const router = useRouter();
  const pathname = usePathname();

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (!firebaseUser) {
        setProfile(null);
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  React.useEffect(() => {
    if (!user) {
      setLoading(false); // Not logged in, stop loading
      return;
    }

    setLoading(true);
    // User is logged in, listen for their profile
    const profileDocRef = doc(db, 'profiles', user.uid);
    const unsubProfile = onSnapshot(profileDocRef, (docSnap) => {
      if (docSnap.exists()) {
        setProfile({ id: docSnap.id, ...docSnap.data() } as UserProfile);
      } else {
        setProfile(null);
      }
      setLoading(false);
    }, (error) => {
      console.error("Error fetching profile:", error);
      setProfile(null);
      setLoading(false);
    });

    return () => unsubProfile();
  }, [user]);
  
  React.useEffect(() => {
    if (loading) return; // Don't redirect until all data is loaded

    const isPublicRoute = PUBLIC_ROUTES.includes(pathname);
    const isAuthPage = pathname === '/login' || pathname === '/create-account';
    const isLandingPage = pathname === '/';


    if (!user) {
      // Not logged in
      if (!isPublicRoute) {
        router.replace('/login');
      }
    } else {
      // Logged in
      if (!profile) {
        // No profile, needs to create one
        if (pathname !== '/create-account') {
          router.replace('/create-account');
        }
      } else {
        // Has profile, should not be on auth pages
         if (isAuthPage || isLandingPage) {
            router.replace(profile.accountType === 'doctor' ? '/doctor/home' : '/mymedicine');
         }
      }
    }
  }, [user, profile, loading, pathname, router]);

  if (PUBLIC_ROUTES.includes(pathname) && !loading && !user) {
     return (
        <AuthContext.Provider value={{ user: null, profile: null, loading: false, serializableUser: null }}>
          {children}
        </AuthContext.Provider>
      );
  }

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }
  
    const serializableUser = user ? {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        phoneNumber: user.phoneNumber,
    } : null;

  return (
    <AuthContext.Provider value={{ user, profile, loading, serializableUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = (): AuthContextType => {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
