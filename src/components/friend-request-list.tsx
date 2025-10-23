
'use client';

import * as React from 'react';
import { collection, onSnapshot, query, where, Timestamp } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { FriendRequest } from '@/types';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { useToast } from '@/hooks/use-toast';
import { Check, X, Loader2, UserPlus } from 'lucide-react';
import { respondToFriendRequest } from '@/app/actions';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Separator } from './ui/separator';
import type { AuthUser } from '@/types';

interface FriendRequestListProps {
  user: AuthUser;
  isInsideCard?: boolean;
}

export function FriendRequestList({ user, isInsideCard = false }: FriendRequestListProps) {
  const [requests, setRequests] = React.useState<FriendRequest[]>([]);
  const [loading, setLoading] = React.useState(true);
  const { toast } = useToast();

  React.useEffect(() => {
    if (user) {
      const q = query(
        collection(db, 'friendRequests'),
        where('to', '==', user.uid),
        where('status', '==', 'pending')
      );
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const reqs: FriendRequest[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          // Ensure createdAt is a Timestamp object before treating it as one
          if (data.createdAt && typeof data.createdAt.toDate === 'function') {
            reqs.push({ id: doc.id, ...data } as FriendRequest);
          }
        });
        // Correctly sort by converting Firestore Timestamp to JS Date
        setRequests(reqs.sort((a, b) => {
            const dateA = (a.createdAt as Timestamp).toDate();
            const dateB = (b.createdAt as Timestamp).toDate();
            return dateB.getTime() - dateA.getTime();
        }));
        setLoading(false);
      }, (error) => {
        console.error("Error fetching friend requests:", error);
        setLoading(false);
      });

      return () => unsubscribe();
    }
  }, [user]);

  const handleResponse = async (requestId: string, response: 'accepted' | 'declined') => {
      const firebaseUser = auth.currentUser;
      if (!firebaseUser) {
        toast({ variant: 'destructive', title: 'Authentication Error', description: 'You must be logged in.' });
        return;
      }
      
      try {
        const idToken = await firebaseUser.getIdToken(true);
        const result = await respondToFriendRequest(idToken, requestId, response);

        if (result.success) {
            toast({
                title: `Request ${response}`,
                description: response === 'accepted' ? `You are now connected with ${result.otherUserName}.` : `You have declined the request.`,
            });
        } else {
            throw new Error(result.error);
        }
      } catch(e: any) {
        toast({
              variant: 'destructive',
              title: 'Error',
              description: e.message || 'An unknown error occurred.',
          });
      }
  }

  const content = (
    <>
      <div className="flex items-center justify-between px-1 mb-2">
        <h3 className="text-lg font-semibold">Family Requests</h3>
        {requests.length > 0 && <span className="text-xs font-bold bg-primary text-primary-foreground h-5 w-5 rounded-full flex items-center justify-center">{requests.length}</span>}
      </div>
      {loading ? (
        <div className="flex items-center justify-center p-4"><Loader2 className="animate-spin" /></div>
      ) : requests.length === 0 ? (
        <p className="text-sm text-muted-foreground px-1">No pending family requests.</p>
      ) : (
        <div className='space-y-3 max-h-96 overflow-y-auto'>
          {requests.map((req) => (
            <Card key={req.id}>
              <CardContent className='p-3'>
                <div className='flex items-center gap-3'>
                    <Avatar>
                        <AvatarImage src={req.fromPictureUrl} />
                        <AvatarFallback>{req.fromName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <p className='text-sm flex-1'>
                      <span className='font-semibold'>{req.fromName}</span> sent you a family request.
                    </p>
                </div>
                <div className="flex justify-end space-x-2 mt-3">
                  <Button size="sm" variant="outline" onClick={() => handleResponse(req.id, 'declined')}>
                    <X className="h-4 w-4 mr-1" /> Decline
                  </Button>
                  <Button size="sm" onClick={() => handleResponse(req.id, 'accepted')}>
                    <Check className="h-4 w-4 mr-1" /> Accept
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </>
  );
  
  return (
    <div className="space-y-4">
      {content}
    </div>
  );
}
