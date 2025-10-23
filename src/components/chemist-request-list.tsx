
'use client';

import * as React from 'react';
import { collection, onSnapshot, query, where, doc, updateDoc } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { MedicationRequest, InventoryItem } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Loader2, Package, Check, X, Search, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { fulfillMedicationRequest } from '@/app/actions';
import { Alert, AlertTitle, AlertDescription } from './ui/alert';
import { Separator } from './ui/separator';
import { Input } from './ui/input';
import { Label } from './ui/label';
import type { AuthUser } from '@/types';


const FulfillRequestDialog = ({
    request,
    user,
    onFinished
} : {
    request: MedicationRequest,
    user: AuthUser,
    onFinished: () => void
}) => {
    const [inventory, setInventory] = React.useState<InventoryItem[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [selectedItem, setSelectedItem] = React.useState<InventoryItem | null>(null);
    const [quantity, setQuantity] = React.useState(1);
    const [isFulfilling, setIsFulfilling] = React.useState(false);
    const { toast } = useToast();

    React.useEffect(() => {
        const invQuery = query(
            collection(db, 'inventory'),
            where('userId', '==', user.uid)
        );
        const unsubscribe = onSnapshot(invQuery, (snapshot) => {
            const items: InventoryItem[] = [];
            snapshot.forEach(doc => items.push({ id: doc.id, ...doc.data()} as InventoryItem));
            setInventory(items.filter(item => (item.boxes * item.unitsPerBox * item.medicinesPerUnit) > 0)); // Only show items in stock
            setLoading(false);
        });
        return () => unsubscribe();
    }, [user]);

    const handleFulfill = async () => {
        if (!selectedItem || !auth.currentUser) return;
        
        const totalStock = selectedItem.boxes * selectedItem.unitsPerBox * selectedItem.medicinesPerUnit;
        if (quantity > totalStock) {
            toast({ variant: 'destructive', title: 'Error', description: 'Not enough stock to fulfill this quantity.'});
            return;
        }

        setIsFulfilling(true);
        try {
            const idToken = await auth.currentUser.getIdToken(true);
            const result = await fulfillMedicationRequest(
                idToken,
                request.id,
                selectedItem.id,
                request.customerId,
                quantity
            );

            if (result.success) {
                toast({ title: 'Success', description: 'Request fulfilled and inventory updated.'});
                onFinished();
            } else {
                toast({ variant: 'destructive', title: 'Error', description: result.error});
            }
        } catch (error) {
             const message = error instanceof Error ? error.message : 'An unexpected error occurred.';
             toast({ variant: 'destructive', title: 'Error', description: message });
        } finally {
            setIsFulfilling(false);
        }
    }

    return (
        <DialogContent className="sm:max-w-lg">
            <DialogHeader>
                <DialogTitle>Fulfill Request</DialogTitle>
                <DialogDescription>
                    Select an item and quantity from your inventory for <span className="font-bold">{request.customerName}</span>.
                </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4">
                 {loading ? (
                    <Loader2 className="animate-spin" />
                ) : inventory.length > 0 ? (
                    <div className="space-y-4">
                        <div>
                             <Label>Select Medicine</Label>
                             <div className="space-y-2 max-h-60 overflow-y-auto border rounded-md p-2">
                                {inventory.map(item => (
                                    <Card 
                                        key={item.id} 
                                        className={`cursor-pointer ${selectedItem?.id === item.id ? 'border-primary ring-2 ring-primary' : ''}`}
                                        onClick={() => setSelectedItem(item)}
                                    >
                                        <CardContent className="p-3">
                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <p className="font-semibold">{item.name}</p>
                                                    <p className="text-sm text-muted-foreground">Expires: {item.expiryDate}</p>
                                                </div>
                                                <p className="text-lg font-bold">{(item.boxes * item.unitsPerBox * item.medicinesPerUnit).toLocaleString()} <span className="text-sm font-normal">total units</span></p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                        {selectedItem && (
                            <div>
                                <Label htmlFor="quantity">Quantity</Label>
                                <Input 
                                    id="quantity"
                                    type="number"
                                    value={quantity}
                                    onChange={(e) => setQuantity(parseInt(e.target.value, 10) || 1)}
                                    min="1"
                                    max={selectedItem.boxes * selectedItem.unitsPerBox * selectedItem.medicinesPerUnit}
                                />
                            </div>
                        )}
                    </div>
                ) : (
                     <Alert>
                        <Info className="h-4 w-4" />
                        <AlertTitle>Inventory Empty</AlertTitle>
                        <AlertDescription>
                           You have no items in your inventory to fulfill requests.
                        </AlertDescription>
                    </Alert>
                )}
            </div>
            <div className="flex justify-end gap-2">
                <Button variant="ghost" onClick={onFinished}>Cancel</Button>
                <Button onClick={handleFulfill} disabled={!selectedItem || isFulfilling || quantity < 1}>
                    {isFulfilling ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Check className="mr-2 h-4 w-4"/>}
                    Fulfill Request
                </Button>
            </div>
        </DialogContent>
    )
}

interface ChemistRequestListProps {
  user: AuthUser;
  isInsideCard?: boolean;
}

export function ChemistRequestList({ user, isInsideCard = false }: ChemistRequestListProps) {
  const [requests, setRequests] = React.useState<MedicationRequest[]>([]);
  const [loading, setLoading] = React.useState(true);
  const { toast } = useToast();
  const [activeRequest, setActiveRequest] = React.useState<MedicationRequest | null>(null);

  React.useEffect(() => {
    if (user) {
      const q = query(
        collection(db, 'requests', user.uid, 'medicationRequests'),
        where('status', '==', 'pending')
      );
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const reqs: MedicationRequest[] = [];
        querySnapshot.forEach((doc) => {
          reqs.push({ id: doc.id, ...doc.data() } as MedicationRequest);
        });
        setRequests(reqs.sort((a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime()));
        setLoading(false);
      }, (error) => {
        console.error("Error fetching requests:", error);
        setLoading(false);
      });

      return () => unsubscribe();
    }
  }, [user]);

  const handleDeclineRequest = async (requestId: string) => {
    try {
        const requestDocRef = doc(db, 'requests', user.uid, 'medicationRequests', requestId);
        await updateDoc(requestDocRef, { status: 'declined' });
        toast({ title: 'Request Declined' });
    } catch (error) {
        toast({ variant: 'destructive', title: 'Error', description: 'Could not decline request.' });
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center p-4"><Loader2 className="animate-spin" /></div>;
  }
  
  const content = (
    <>
        {requests.length === 0 ? (
           <div className={!isInsideCard ? "text-center py-16 border-2 border-dashed rounded-lg" : "text-center py-4"}>
                <Package className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-medium text-muted-foreground">No pending requests</h3>
                <p className="mt-1 text-sm text-muted-foreground">New requests from customers will appear here.</p>
            </div>
        ) : (
            <div className='space-y-4'>
                {requests.map((req) => (
                    <Card key={req.id} className="flex flex-col sm:flex-row justify-between items-start p-4 gap-4">
                        <div>
                            <p className='font-semibold text-lg'>Medication Request</p>
                            <p className='text-sm'>From: <span className="text-muted-foreground">{req.customerName}</span></p>
                        </div>
                        <div className="flex gap-2 self-start sm:self-center">
                            <Button size="sm" variant="outline" onClick={() => handleDeclineRequest(req.id)}>
                                <X className="h-4 w-4 mr-2" /> Decline
                            </Button>
                            <DialogTrigger asChild>
                                <Button size="sm" onClick={() => setActiveRequest(req)}>
                                    <Search className="h-4 w-4 mr-2" /> Fulfill
                                </Button>
                            </DialogTrigger>
                        </div>
                    </Card>
                ))}
            </div>
        )}
    </>
  );

  return (
    <Dialog open={!!activeRequest} onOpenChange={(open) => !open && setActiveRequest(null)}>
        {isInsideCard ? (
           <div className='space-y-4'>
                <div className="flex items-center justify-between px-1">
                    <h3 className="text-lg font-semibold">Medication Requests</h3>
                     {requests.length > 0 && <span className="text-xs font-bold bg-primary text-primary-foreground h-5 w-5 rounded-full flex items-center justify-center">{requests.length}</span>}
                </div>
                {content}
                <Separator/>
            </div>
        ) : (
            <Card>
                <CardContent className="pt-6">
                    {content}
                </CardContent>
            </Card>
        )}
        {activeRequest && <FulfillRequestDialog request={activeRequest} user={user} onFinished={() => setActiveRequest(null)}/>}
    </Dialog>
  );
}
