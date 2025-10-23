'use client';

import * as React from 'react';
import type { UserProfile, UserProfileInput } from '@/types';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { db, auth } from '@/lib/firebase';
import { doc, setDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Camera, Save, User as UserIcon, Users, Heart, Plus, AtSign, ArrowLeft, ShieldQuestion } from 'lucide-react';
import { User as FirebaseUser } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { Badge } from './ui/badge';

interface ProfileViewProps {
  profile: UserProfile | null;
  user: FirebaseUser | null;
}

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  username: z.string().min(3, 'Username must be 3-20 characters.')
    .max(20, 'Username must be 3-20 characters.')
    .regex(/^[a-zA-Z0-9_.]+$/, 'Username can only contain letters, numbers, underscores, and periods.')
    .optional().or(z.literal('')),
  allergies: z.string().optional(),
  emergencyContact: z.string().optional(),
  pictureUrl: z.string().url().optional().or(z.literal('')),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

const WhatsAppUserIcon = () => (
    <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-muted-foreground/40 fill-current">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 4c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6zm0 14c-2.03 0-4.43-.82-6.14-2.88.03-2.01 4.09-3.12 6.14-3.12s6.11 1.11 6.14 3.12C16.43 19.18 14.03 20 12 20z"></path>
    </svg>
)


export function ProfileView({ profile, user }: ProfileViewProps) {
  const [isEditing, setIsEditing] = React.useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: profile?.name || user?.displayName || '',
      username: profile?.username || '',
      allergies: profile?.allergies || '',
      emergencyContact: profile?.emergencyContact || '',
      pictureUrl: profile?.pictureUrl || user?.photoURL || '',
    },
  });

  React.useEffect(() => {
    // If there is no profile, but we have a user, start in editing mode.
    if (user && !profile) {
        setIsEditing(true);
    }
    form.reset({
      name: profile?.name || user?.displayName || '',
      username: profile?.username || '',
      allergies: profile?.allergies || '',
      emergencyContact: profile?.emergencyContact || '',
      pictureUrl: profile?.pictureUrl || user?.photoURL || '',
    });
  }, [profile, user, form]);

  const onSubmit = async (data: ProfileFormValues) => {
    if (!user) {
      toast({ variant: 'destructive', title: 'Error', description: 'You are not logged in.' });
      return;
    }
    
    const newUsername = data.username ? data.username.toLowerCase() : '';

    // Check if username is taken, but only if it has changed.
    if (newUsername && newUsername !== profile?.username) {
        const q = query(collection(db, 'profiles'), where('username', '==', newUsername));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
            form.setError('username', { type: 'manual', message: 'This username is already taken.' });
            return;
        }
    }

    const profileData: UserProfileInput = {
      userId: user.uid,
      name: data.name,
      username: newUsername,
      allergies: data.allergies || '',
      emergencyContact: data.emergencyContact || '',
      pictureUrl: data.pictureUrl || '',
    };

    try {
      await setDoc(doc(db, 'profiles', user.uid), profileData, { merge: true });
      toast({ title: 'Success', description: 'Profile updated successfully.' });
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to save profile.' });
    }
  };
  
  const handleEditToggle = () => setIsEditing(!isEditing);

  if (!user) {
      return (
          <Card>
              <CardHeader>
                  <CardTitle>Profile</CardTitle>
              </CardHeader>
              <CardContent>
                  <p>Please sign in to view your profile.</p>
              </CardContent>
          </Card>
      )
  }

  if (!profile && !isEditing) {
      return (
          <div className="text-center py-16 border-2 border-dashed rounded-lg">
            <UserIcon className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium text-muted-foreground">No profile found</h3>
            <p className="mt-1 text-sm text-muted-foreground">Create your profile to get started.</p>
            <Button className="mt-6" onClick={() => setIsEditing(true)}>Create Profile</Button>
          </div>
      )
  }

  return (
    <div>
        <div className="flex items-center mb-6">
            <Button variant="ghost" size="icon" onClick={() => router.back()} className="mr-4">
                <ArrowLeft />
            </Button>
            <h1 className="text-3xl font-bold tracking-tight font-headline">My Profile</h1>
        </div>
        <Card>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <CardHeader>
                        <div className="flex flex-col sm:flex-row items-center space-x-0 sm:space-x-6 space-y-4 sm:space-y-0">
                            <div className="relative">
                                <Avatar className="h-24 w-24">
                                    <AvatarImage src={form.watch('pictureUrl') || undefined} alt={profile?.name} />
                                    <AvatarFallback className="bg-muted">
                                        <WhatsAppUserIcon/>
                                    </AvatarFallback>
                                </Avatar>
                                {isEditing && (
                                <label htmlFor='picture-upload' className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-1.5 cursor-pointer hover:bg-primary/90 border-2 border-card">
                                    <Plus className="h-4 w-4"/>
                                    <Input id="picture-upload" type="file" className="hidden" accept='image/*' 
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                const reader = new FileReader();
                                                reader.onload = (event) => {
                                                    form.setValue('pictureUrl', event.target?.result as string);
                                                };
                                                reader.readAsDataURL(file);
                                                toast({title: "Image Preview", description: "Image preview updated. Uploading to storage is not implemented in this demo."});
                                            }
                                        }}
                                    />
                                </label>
                                )}
                            </div>
                            <div className="text-center sm:text-left flex-1">
                                {isEditing ? (
                                    <FormField
                                        control={form.control}
                                        name="name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Name</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Your Name" {...field} className="text-2xl font-bold"/>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                ) : (
                                    <div className="flex items-center gap-3">
                                        <CardTitle className="font-headline text-4xl">{profile?.name || 'Your Name'}</CardTitle>
                                        {profile?.accountType === 'chemist' && (
                                            <Badge variant="outline" className="text-base">Chemist</Badge>
                                        )}
                                    </div>
                                )}
                                {!isEditing && profile?.username && (
                                     <p className="text-lg text-muted-foreground mt-1">@{profile.username}</p>
                                )}
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {isEditing ? (
                             <FormField
                                control={form.control}
                                name="username"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Username</FormLabel>
                                        <div className="relative">
                                            <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <FormControl>
                                                <Input placeholder="your_unique_username" {...field} className="pl-8"/>
                                            </FormControl>
                                        </div>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        ) : null}
                         {isEditing && (
                            <FormField
                                control={form.control}
                                name="pictureUrl"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Profile Picture URL</FormLabel>
                                    <FormControl>
                                    <Input placeholder="https://your-image-url.com" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                        )}
                        {isEditing ? (
                             <FormField
                                control={form.control}
                                name="allergies"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Allergies</FormLabel>
                                        <FormControl>
                                            <Textarea placeholder="e.g., Peanuts, Pollen..." {...field} />
                                        </FormControl>
                                        <p className="text-sm text-muted-foreground">This information will not be shown publicly.</p>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        ) : (
                            <div>
                                <h3 className="font-medium">Allergies</h3>
                                <p className="text-muted-foreground mt-2 rounded-md border p-3 min-h-[80px]">
                                    {profile?.allergies || "No allergies specified."}
                                </p>
                            </div>
                        )}
                         {isEditing ? (
                             <FormField
                                control={form.control}
                                name="emergencyContact"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Emergency Contact</FormLabel>
                                        <FormControl>
                                            <Textarea placeholder="e.g., Jane Doe - 555-1234" {...field} />
                                        </FormControl>
                                        <p className="text-sm text-muted-foreground">This information will not be shown publicly.</p>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        ) : (
                            <div>
                                <h3 className="font-medium flex items-center gap-2">
                                    <ShieldQuestion className="h-4 w-4" />
                                    Emergency Contact
                                </h3>
                                <p className="text-muted-foreground mt-2 rounded-md border p-3 min-h-[80px]">
                                    {profile?.emergencyContact || "No emergency contact specified."}
                                </p>
                            </div>
                        )}
                    </CardContent>
                    <CardFooter className="flex justify-end space-x-2">
                        {isEditing ? (
                            <>
                               <Button type="button" variant="ghost" onClick={handleEditToggle}>Cancel</Button>
                               <Button type="submit" disabled={form.formState.isSubmitting}>
                                   <Save className="mr-2 h-4 w-4"/>
                                   {form.formState.isSubmitting ? 'Saving...' : 'Save Profile'}
                               </Button>
                            </>
                        ) : (
                            <Button type="button" onClick={handleEditToggle}>Edit Profile</Button>
                        )}
                    </CardFooter>
                </form>
            </Form>
        </Card>
    </div>
  );
}