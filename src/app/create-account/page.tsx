
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { updateProfile, User as FirebaseUser } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDocs, collection, query, where, setDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { AtSign, Stethoscope, Loader2, User as UserIcon } from 'lucide-react';
import { Logo } from '@/components/logo';
import { UserProfileInput } from '@/types';
import { signOut } from '../actions';
import { useAuth } from '../auth-provider';

const createAccountSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  username: z.string().min(3, 'Username must be 3-20 characters.')
    .max(20, 'Username must be 3-20 characters.')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores.'),
  accountType: z.enum(['normal', 'doctor'], { required_error: 'You must select an account type.' }),
});

type CreateAccountFormValues = z.infer<typeof createAccountSchema>;

export default function CreateAccountPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [submitting, setSubmitting] = React.useState(false);
    const { user, loading: authLoading, profile } = useAuth();
    
    const form = useForm<CreateAccountFormValues>({
        resolver: zodResolver(createAccountSchema),
        defaultValues: {
            name: '',
            username: '',
            accountType: undefined,
        },
    });

    React.useEffect(() => {
        if (!authLoading && user) {
            form.setValue('name', user.displayName || '');
        }
    }, [user, authLoading, form]);


    if (authLoading || !user) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
                <Loader2 className="h-8 w-8 animate-spin"/>
                <p className="mt-4">{authLoading ? "Loading user session..." : "Redirecting..."}</p>
            </div>
        )
    }

    const handleSignOut = async () => {
        await auth.signOut();
        await signOut();
    }

    const onSubmit = async (data: CreateAccountFormValues) => {
        if (!user) {
            toast({ variant: 'destructive', title: 'Error', description: 'User session not found.' });
            return;
        }
    
        setSubmitting(true);
    
        try {
            const newUsername = data.username.toLowerCase();
            const q = query(collection(db, 'profiles'), where('username', '==', newUsername));
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
                form.setError('username', { type: 'manual', message: 'This username is already taken.' });
                setSubmitting(false);
                return;
            }
    
            await updateProfile(user, { displayName: data.name });

            const profileRef = doc(db, 'profiles', user.uid);
            const profileData: UserProfileInput = {
                userId: user.uid,
                name: data.name,
                username: newUsername,
                accountType: data.accountType,
                email: user.email || '',
                emailVerified: user.emailVerified,
                phoneNumber: user.phoneNumber || '',
                phoneVerified: !!user.phoneNumber,
                pictureUrl: user.photoURL || '',
                allergies: '',
                emergencyContact: '',
            };
            await setDoc(profileRef, profileData, { merge: true });

            toast({
                title: 'Welcome!',
                description: 'Your account has been created successfully.',
            });
            
            // The AuthProvider will handle the redirect automatically after profile is set.
    
        } catch (error: any) {
            console.error('Error creating account:', error);
            toast({
                variant: 'destructive',
                title: 'Account Creation Failed',
                description: error.message,
            });
        } finally {
            setSubmitting(false);
        }
    }


    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
          <div className="w-full max-w-lg mx-auto space-y-6">
            <div className="flex justify-center mb-8">
                <Logo />
            </div>
            <Card>
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold font-headline">Finalize Your Account</CardTitle>
                <CardDescription>
                  Welcome! Complete your profile for <span className="font-semibold text-foreground">{user.email || user.phoneNumber}</span>.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel htmlFor="name">Full Name</FormLabel>
                                        <FormControl>
                                            <Input id="name" placeholder="Your Name" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="username"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel htmlFor="username">Username</FormLabel>
                                         <div className="relative">
                                            <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <FormControl>
                                                <Input id="username" placeholder="your_username" {...field} className="pl-8"/>
                                            </FormControl>
                                        </div>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="accountType"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Account Type</FormLabel>
                                    <FormControl>
                                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <Button
                                                type="button"
                                                variant={field.value === 'normal' ? 'default' : 'outline'}
                                                className="h-32 flex flex-col gap-2 p-4 justify-center"
                                                onClick={() => field.onChange('normal')}
                                            >
                                                <UserIcon className="h-8 w-8" />
                                                <span className="font-semibold">Personal User</span>
                                                <span className="text-xs text-muted-foreground text-center">Manage your personal medications.</span>
                                            </Button>
                                            <Button
                                                type="button"
                                                variant={field.value === 'doctor' ? 'default' : 'outline'}
                                                className="h-32 flex flex-col gap-2 p-4 justify-center"
                                                onClick={() => field.onChange('doctor')}
                                            >
                                                <Stethoscope className="h-8 w-8" />
                                                <span className="font-semibold">Doctor</span>
                                                <span className="text-xs text-muted-foreground text-center">Manage patient interactions.</span>
                                            </Button>
                                        </div>
                                    </FormControl>
                                     <FormMessage />
                                </FormItem>
                            )}
                        />
                        
                        <Button type="submit" disabled={submitting} className="w-full">
                            {submitting ? <Loader2 className="animate-spin mr-2"/> : null}
                            Complete Account Setup
                        </Button>
                    </form>
                </Form>
              </CardContent>
               <CardFooter>
                    <Button variant="link" className="w-full" onClick={handleSignOut}>
                        Not you? Sign out
                    </Button>
                </CardFooter>
            </Card>
          </div>
        </div>
    );
}
