
'use client';

import * as React from 'react';
import { auth, googleProvider, signInWithRedirect } from '@/lib/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Logo } from './logo';
import { Loader2, Mail } from 'lucide-react';
import { Button } from './ui/button';
import { useToast } from '@/hooks/use-toast';

export function LoginPage() {
  const [loading, setLoading] = React.useState(false);
  const { toast } = useToast();
  
  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
        // Use redirect method for all sign-ins.
        await signInWithRedirect(auth, googleProvider);
    } catch (error: any) {
        console.error("Google sign-in error:", error);
        toast({
            variant: 'destructive',
            title: 'Sign In Failed',
            description: error.message || 'Could not sign in with Google. Please try again.'
        });
        setLoading(false);
    }
  }

  if (loading) {
     return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
            <Loader2 className="h-8 w-8 animate-spin"/>
            <p className="mt-4">Redirecting to Google...</p>
        </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="flex justify-center">
          <Logo />
        </div>
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold font-headline">Welcome to Bluepill</CardTitle>
            <CardDescription>Sign in to continue</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             <Button onClick={handleGoogleSignIn} variant="outline" className="w-full">
                <Mail className="mr-2 h-4 w-4"/>
                Sign in with Google
             </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
