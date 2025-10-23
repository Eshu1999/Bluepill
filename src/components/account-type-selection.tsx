'use client';

import * as React from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { User, FlaskConical } from 'lucide-react';
import { Logo } from './logo';

interface AccountTypeSelectionProps {
  user: FirebaseUser;
}

export function AccountTypeSelection({ user }: AccountTypeSelectionProps) {
  const [loading, setLoading] = React.useState(false);
  const { toast } = useToast();

  const handleSelection = async (accountType: 'normal' | 'chemist') => {
    setLoading(true);
    try {
      const profileRef = doc(db, 'profiles', user.uid);
      await setDoc(profileRef, { 
        accountType: accountType,
        userId: user.uid,
        name: user.displayName || 'New User',
        email: user.email,
        pictureUrl: user.photoURL || '',
      }, { merge: true });

      toast({
        title: 'Account type selected!',
        description: `You are now set up as a ${accountType} user.`,
      });
      // The page will automatically re-render to the dashboard due to the listener in `Home`
    } catch (error) {
      console.error('Error setting account type:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not set your account type. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-md mx-auto">
        <div className="flex justify-center mb-8">
            <Logo />
        </div>
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold font-headline">Choose Your Account Type</CardTitle>
            <CardDescription>Select how you'd like to use Bluepill.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              variant="outline"
              className="h-32 flex flex-col gap-2 p-4 justify-center"
              onClick={() => handleSelection('normal')}
              disabled={loading}
            >
              <User className="h-8 w-8" />
              <span className="font-semibold">Normal User</span>
              <span className="text-xs text-muted-foreground text-center">Manage your personal medications.</span>
            </Button>
            <Button
              variant="outline"
              className="h-32 flex flex-col gap-2 p-4 justify-center"
              onClick={() => handleSelection('chemist')}
              disabled={loading}
            >
              <FlaskConical className="h-8 w-8" />
              <span className="font-semibold">Chemist</span>
               <span className="text-xs text-muted-foreground text-center">Manage inventory and orders.</span>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
