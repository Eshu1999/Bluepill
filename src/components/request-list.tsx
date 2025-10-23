
'use client';

import * as React from 'react';
import { collection, doc, onSnapshot, query, updateDoc, where, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { SharedMedicationRequest, Medication, MedicationInput } from '@/types';
import { Button } from './ui/button';
import { useToast } from '@/hooks/use-toast';
import { Check, Loader2, MailQuestion, X } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import type { AuthUser } from '@/types';

interface RequestListProps {
  user: AuthUser;
}

export function RequestList({ user }: RequestListProps) {
  const [requests, setRequests] = React.useState<SharedMedicationRequest[]>([]);
  const [loading, setLoading] = React.useState(true);
  const { toast } = useToast();

  React.useEffect(() => {
    if (user) {
      const q = query(
        collection(db, 'requests', user.uid, 'medicationRequests'),
        where('status', '==', 'pending')
      );
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const reqs: SharedMedicationRequest[] = [];
        querySnapshot.forEach((doc) => {
          reqs.push({ id: doc.id, ...doc.data() } as SharedMedicationRequest);
        });
        setRequests(reqs);
        setLoading(false);
      }, (error) => {
        console.error("Error fetching requests:", error);
        setLoading(false);
      });

      return () => unsubscribe();
    }
  }, [user]);

  const handleAcceptRequest = async (request: SharedMedicationRequest) => {
      try {
        // 1. Add medication to user's collection
        const medicationData: Omit<Medication, 'id'> = {
            ...request.medicationDetails,
            userId: user.uid,
        };
        await addDoc(collection(db, 'medications'), medicationData);

        // 2. Update the request status to 'accepted'
        const requestDocRef = doc(db, 'requests', user.uid, 'medicationRequests', request.id);
        await updateDoc(requestDocRef, { status: 'accepted' });

        toast({
            title: 'Request Accepted',
            description: `${request.medicationDetails.name} has been added to your medications.`
        });

      } catch (error) {
          console.error("Error accepting request:", error);
          toast({
              variant: 'destructive',
              title: 'Error',
              description: 'Could not accept the request. Please try again.'
          });
      }
  }

  const handleDeclineRequest = async (requestId: string) => {
    try {
        const requestDocRef = doc(db, 'requests', user.uid, 'medicationRequests', requestId);
        await updateDoc(requestDocRef, { status: 'declined' });

        toast({
            title: `Request Declined`,
            description: `The medication sharing request has been declined.`
        });

    } catch (error) {
        console.error("Error declining request:", error);
        toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Could not decline the request status. Please try again.'
        });
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center p-4"><Loader2 className="animate-spin" /></div>;
  }

  if (requests.length === 0) {
      return null;
  }


  return (
    <div className='space-y-4'>
        <h3 className="text-lg font-semibold px-1">Medication Requests</h3>
        <div className='space-y-3 max-h-96 overflow-y-auto'>
            {requests.map((req) => (
                <Card key={req.id}>
                    <CardContent className='p-4'>
                        <p className='text-sm font-medium'>{req.medicationDetails.name}</p>
                        <p className='text-sm text-muted-foreground'>From: {req.chemistName}</p>
                        <div className="flex justify-end space-x-2 mt-4">
                            <Button size="icon" variant="outline" onClick={() => handleDeclineRequest(req.id)}>
                                <X className="h-4 w-4" />
                            </Button>
                            <Button size="icon" onClick={() => handleAcceptRequest(req)}>
                                <Check className="h-4 w-4" />
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    </div>
  );
}
