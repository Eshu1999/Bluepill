
'use client';

import type { Medication } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { doc, deleteDoc } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { CalendarDays, Clock, FilePenLine, Trash2, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { buttonVariants } from './ui/button';
import { Badge } from './ui/badge';
import { differenceInDays, format, isPast, parse } from 'date-fns';

interface MedicationCardProps {
  medication: Medication;
  onEdit: () => void;
}

const getExpiryStatus = (expiryDate: string) => {
    const date = parse(expiryDate, 'yyyy-MM-dd', new Date());
    if (isPast(date)) return 'expired';
    if (differenceInDays(date, new Date()) <= 30) return 'expiring-soon';
    return 'ok';
}

export default function MedicationCard({ medication, onEdit }: MedicationCardProps) {
  const { toast } = useToast();
  
  const names = medication.name.split(',').map(name => name.trim());
  const dosages = medication.dosage.split(',').map(dosage => dosage.trim());

  const handleDelete = async () => {
    if (!auth.currentUser) {
        toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in to delete.' });
        return;
    }
    try {
      await deleteDoc(doc(db, 'medications', medication.id));
      toast({ title: 'Success', description: 'Medication deleted successfully.' });
    } catch (error) {
      console.error('Error deleting medication:', error);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to delete medication.' });
    }
  };

  const expiryStatus = medication.expiryDate ? getExpiryStatus(medication.expiryDate) : null;
  const expiryDate = medication.expiryDate ? parse(medication.expiryDate, 'yyyy-MM-dd', new Date()) : null;
  const daysUntilExpiry = expiryDate ? differenceInDays(expiryDate, new Date()) : null;


  return (
    <Card className={cn('flex flex-col')}>
      <CardHeader>
        <CardTitle className="font-headline text-2xl">
          {names.length > 1 ? 'Medication Group' : names[0]}
        </CardTitle>
        {names.length === 1 && <CardDescription className="text-lg">{medication.dosage}</CardDescription>}
      </CardHeader>
      <CardContent className="flex-grow space-y-4">
        {names.length > 1 && (
           <div className="space-y-2 text-lg">
             {names.map((name, index) => (
               <div key={index} className="flex items-start">
                 <span className="font-semibold mr-2">{index + 1}.</span>
                 <div className="flex-1">
                   <div className="font-semibold">{name}</div>
                   <div className="text-base text-muted-foreground">{dosages[index] || 'No dosage info'}</div>
                 </div>
               </div>
             ))}
           </div>
        )}
        <div className="flex items-start text-sm text-muted-foreground">
          <Clock className="mr-2 h-4 w-4 mt-0.5" />
          <div className="flex flex-wrap gap-1">
            {medication.times.map((time) => (
              <div key={time} className="rounded-full bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">
                {time}
              </div>
            ))}
          </div>
        </div>
         {expiryDate && (
          <div className="flex items-center text-sm text-muted-foreground pt-2">
            <CalendarDays className="mr-2 h-4 w-4" />
            <div className={cn('flex items-center gap-2 text-foreground', {
                'text-destructive': expiryStatus === 'expired',
                'text-yellow-600': expiryStatus === 'expiring-soon'
            })}>
                {expiryStatus !== 'ok' && <AlertTriangle className="h-4 w-4" />}
                <span>Expires: {format(expiryDate, 'dd/MM/yyyy')}</span>
                {expiryStatus === 'expiring-soon' && 
                    <Badge variant="outline" className="border-yellow-500 text-yellow-600">
                        {daysUntilExpiry} days
                    </Badge>
                }
                {expiryStatus === 'expired' && 
                    <Badge variant="destructive">Expired</Badge>
                }
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-end space-x-2">
        <Button variant="ghost" size="icon" onClick={onEdit}>
          <FilePenLine className="h-4 w-4" />
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                <Trash2 className="h-4 w-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the medication
                '{medication.name}' from your records.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className={cn(buttonVariants({ variant: 'destructive' }))}>
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardFooter>
    </Card>
  );
}
