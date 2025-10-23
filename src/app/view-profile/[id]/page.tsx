
'use client';

import * as React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { UserProfile, AuthUser } from '@/types';
import { ViewProfilePageContent } from './view-profile-page-content';
import { Loader2 } from 'lucide-react';

export default function ViewProfilePage() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;

    const [user, setUser] = React.useState<FirebaseUser | null>(null);
    const [currentUserProfile, setCurrentUserProfile] = React.useState<UserProfile | null>(null);
    const [viewingProfile, setViewingProfile] = React.useState<UserProfile | null>(null);
    const [loading, setLoading] = React.useState(true);

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
        if (user && id) {
            setLoading(true);
            const unsubCurrentUser = onSnapshot(doc(db, 'profiles', user.uid), (doc) => {
                if (doc.exists()) {
                    setCurrentUserProfile({ id: doc.id, ...doc.data() } as UserProfile);
                } else {
                    router.replace('/create-account');
                }
            }, (error) => {
                console.error("Error fetching current user profile:", error);
                router.replace('/');
            });

            const unsubViewingUser = onSnapshot(doc(db, 'profiles', id), (doc) => {
                if (doc.exists()) {
                    setViewingProfile({ id: doc.id, ...doc.data() } as UserProfile);
                } else {
                    setViewingProfile(null);
                }
                setLoading(false);
            }, (error) => {
                console.error("Error fetching viewing profile:", error);
                setLoading(false);
            });
            
            return () => {
                unsubCurrentUser();
                unsubViewingUser();
            };
        } else if (!user) {
            setLoading(false);
        }
    }, [user, id, router]);
    
    if (loading) {
        return (
          <div className="flex h-screen w-screen items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        );
    }
    
    if (!viewingProfile) {
        return <div className="flex h-screen w-screen items-center justify-center"><p>Profile not found.</p></div>;
    }

    if (!user || !currentUserProfile) {
        // This state can happen briefly while loading, so we show the loader
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
        <ViewProfilePageContent
            viewingProfile={viewingProfile}
            currentUser={serializableUser}
            currentUserProfile={currentUserProfile}
        />
    );
}
