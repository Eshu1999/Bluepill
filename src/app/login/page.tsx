
'use client';

import * as React from 'react';
import Link from 'next/link';
import { auth, googleProvider, signInWithRedirect } from '@/lib/firebase';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Logo } from '@/components/logo';
import { Loader2, Mail, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '../auth-provider';
import { useRouter } from 'next/navigation';
import { Separator } from '@/components/ui/separator';

export default function LoginPage() {
    const { user, profile, loading } = useAuth();
    const router = useRouter();
    const [isSigningIn, setIsSigningIn] = React.useState(false);
    const { toast } = useToast();

    // The redirect logic is now handled by the AuthProvider.
    // This component only needs to handle the sign-in action.
    
    const handleGoogleSignIn = async () => {
        setIsSigningIn(true);
        try {
            await signInWithRedirect(auth, googleProvider);
            // The page will redirect to Google, and then back.
            // The AuthProvider will handle the user session once redirected back.
        } catch (error: any) {
            console.error("Google sign-in error:", error);
            toast({
                variant: 'destructive',
                title: 'Sign In Failed',
                description: error.message || 'Could not sign in with Google. Please try again.'
            });
            setIsSigningIn(false);
        }
    }
    

    if (loading || isSigningIn || user) {
        return (
             <div className="flex h-screen w-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
                <p className="ml-4">{isSigningIn ? "Redirecting to Google..." : "Checking session..."}</p>
            </div>
        )
    }
    
    // If not loading, and no user, show the login page.
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
            <div className="w-full max-w-sm space-y-8">
                <div className="flex justify-center">
                <Logo />
                </div>
                <Card>
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl font-bold font-headline">Welcome Back</CardTitle>
                    <CardDescription>Sign in to continue to your dashboard.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Button onClick={handleGoogleSignIn} variant="outline" className="w-full" disabled={isSigningIn}>
                        <Mail className="mr-2 h-4 w-4"/>
                        Sign in with Google
                    </Button>
                </CardContent>
                 <CardFooter className="flex-col space-y-4">
                        <div className="relative flex w-full items-center">
                            <div className="flex-grow border-t border-muted"></div>
                            <span className="flex-shrink mx-4 text-xs uppercase text-muted-foreground">Or</span>
                            <div className="flex-grow border-t border-muted"></div>
                        </div>
                        <Button asChild variant="secondary" className="w-full">
                           <Link href="/admin/login">
                                <Shield className="mr-2 h-4 w-4" />
                                Admin Test Login
                           </Link>
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}
