
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { signInWithCustomToken } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Shield, Stethoscope, User as UserIcon } from 'lucide-react';
import { Logo } from '@/components/logo';
import { createAdminSession } from '@/app/actions';

export default function AdminLoginPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = React.useState<false | 'normal' | 'doctor'>(false);

    const handleAdminLogin = async (accountType: 'normal' | 'doctor') => {
        setIsSubmitting(accountType);
        try {
            // Create the session on the server
            const result = await createAdminSession(accountType);
            if (!result.success || !result.token) {
                throw new Error(result.error || "Could not create an admin session.");
            }

            // Sign in on the client with the custom token
            await signInWithCustomToken(auth, result.token);

            toast({
                title: 'Admin Login Successful',
                description: `You are now logged in as a temporary '${accountType}' user.`,
            });
            
            // The AuthProvider will handle the redirect automatically.
            // We just need to give it a moment to pick up the new profile.
             setTimeout(() => {
                const homePage = accountType === 'doctor' ? '/doctor/home' : '/mymedicine';
                router.push(homePage);
             }, 500);


        } catch (error: any) {
            console.error('Error during admin login:', error);
            toast({
                variant: 'destructive',
                title: 'Admin Login Failed',
                description: error.message,
            });
            setIsSubmitting(false);
        }
    }

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
          <div className="w-full max-w-md mx-auto space-y-6">
            <div className="flex justify-center mb-8">
                <Logo />
            </div>
            <Card>
              <CardHeader className="text-center">
                <div className="flex justify-center mb-2">
                    <Shield className="h-10 w-10 text-primary"/>
                </div>
                <CardTitle className="text-2xl font-bold font-headline">Admin Test Login</CardTitle>
                <CardDescription>
                  Select an account type to log in as a temporary test user.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                 <Button
                    variant="outline"
                    className="w-full h-20 flex justify-start items-center text-left"
                    onClick={() => handleAdminLogin('normal')}
                    disabled={!!isSubmitting}
                >
                    {isSubmitting === 'normal' ? <Loader2 className="animate-spin mr-4"/> : <UserIcon className="mr-4 h-8 w-8" />}
                    <div>
                        <p className="font-semibold text-base">Log in as a Normal User</p>
                        <p className="text-muted-foreground text-sm">Access the standard user dashboard.</p>
                    </div>
                </Button>
                 <Button
                    variant="outline"
                    className="w-full h-20 flex justify-start items-center text-left"
                    onClick={() => handleAdminLogin('doctor')}
                    disabled={!!isSubmitting}
                >
                    {isSubmitting === 'doctor' ? <Loader2 className="animate-spin mr-4"/> : <Stethoscope className="mr-4 h-8 w-8" />}
                    <div>
                        <p className="font-semibold text-base">Log in as a Doctor</p>
                        <p className="text-muted-foreground text-sm">Access the doctor's dashboard.</p>
                    </div>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
    );
}

    