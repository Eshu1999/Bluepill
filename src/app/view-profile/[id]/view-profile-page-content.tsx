
'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, UserPlus, MessageSquare } from 'lucide-react';
import type { AuthUser, UserProfile } from '@/types';
import { sendFriendRequest, createOrGetChat } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { auth } from '@/lib/firebase';


const WhatsAppUserIcon = () => (
    <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-muted-foreground/40 fill-current">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 4c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6zm0 14c-2.03 0-4.43-.82-6.14-2.88.03-2.01 4.09-3.12 6.14-3.12s6.11 1.11 6.14 3.12C16.43 19.18 14.03 20 12 20z"></path>
    </svg>
)

export const ViewProfilePageContent = ({ viewingProfile, currentUser, currentUserProfile }: { viewingProfile: UserProfile, currentUser: AuthUser, currentUserProfile: UserProfile }) => {
    const router = useRouter();
    const { toast } = useToast();
    const [requestStatus, setRequestStatus] = React.useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
    const [error, setError] = React.useState<string | null>(null);

    const isOwnProfile = currentUser.uid === viewingProfile.id;
    
    const connectionStatus = React.useMemo(() => {
        if (!currentUserProfile || !viewingProfile || !currentUserProfile.family) return 'none';
        return currentUserProfile.family.includes(viewingProfile.id) ? 'family' : 'none';
    }, [currentUserProfile, viewingProfile]);


    const getConnectionStatusBadge = () => {
        if (connectionStatus === 'family') return <Badge>Family</Badge>;
        return null;
    }
    
    const handleSendRequest = async () => {
        setRequestStatus('sending');
        setError(null);

        const result = await sendFriendRequest(viewingProfile.id);
        if (result.success) {
            setRequestStatus('sent');
            toast({ title: 'Request Sent!', description: result.message });
        } else {
            setRequestStatus('error');
            setError(result.error || 'An unknown error occurred.');
            toast({ variant: 'destructive', title: 'Error', description: result.error });
        }
    }
    
    const handleStartChat = async () => {
        const result = await createOrGetChat(viewingProfile.id);
        if (result.error) {
            toast({ variant: 'destructive', title: 'Error', description: result.error });
        } else {
            router.push(`/messages?chatId=${result.chatId}`);
        }
    }

    const ActionButtons = () => {
        if (isOwnProfile || viewingProfile.accountType === 'chemist') {
            return null;
        }

        if (connectionStatus === 'family') {
            return (
                 <Button onClick={handleStartChat}>
                    <MessageSquare className="mr-2 h-4 w-4"/> Message
                 </Button>
            );
        }

        if (requestStatus === 'sent') {
            return <Button disabled>Request Sent</Button>;
        }

        return (
            <Button onClick={handleSendRequest} disabled={requestStatus === 'sending'}>
                <UserPlus className="mr-2 h-4 w-4"/> Add to Family
            </Button>
        );
    }

    return (
        <div className="container py-8">
             <div className="flex items-center mb-6">
                <Button variant="ghost" size="icon" onClick={() => router.back()} className="mr-4">
                    <ArrowLeft />
                </Button>
                <h1 className="text-3xl font-bold tracking-tight font-headline">{viewingProfile.name}'s Profile</h1>
            </div>
             <Card>
                <CardHeader>
                    <div className="flex flex-col sm:flex-row items-center space-x-0 sm:space-x-6 space-y-4 sm:space-y-0">
                        <Avatar className="h-24 w-24">
                            <AvatarImage src={viewingProfile.pictureUrl || undefined} alt={viewingProfile.name} />
                            <AvatarFallback className="bg-muted">
                                <WhatsAppUserIcon/>
                            </AvatarFallback>
                        </Avatar>
                        <div className="text-center sm:text-left flex-1">
                            <div className="flex items-center justify-center sm:justify-start gap-3">
                                <CardTitle className="font-headline text-4xl">{viewingProfile.name}</CardTitle>
                                {viewingProfile?.accountType === 'chemist' && (
                                    <Badge variant="outline" className="text-base">Chemist</Badge>
                                )}
                                {getConnectionStatusBadge()}
                            </div>
                            {viewingProfile.username && (
                                    <p className="text-lg text-muted-foreground mt-1">@{viewingProfile.username}</p>
                            )}
                        </div>
                        <div className="self-center sm:self-start">
                           <ActionButtons />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {error && (
                        <Alert variant="destructive" className="mt-4">
                            <AlertTitle>Error</AlertTitle>
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
