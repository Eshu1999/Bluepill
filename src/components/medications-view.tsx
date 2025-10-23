
'use client';

import * as React from 'react';
import { collection, onSnapshot, query, where, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Medication, UserProfile } from '@/types';
import { PlusCircle, Pill } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from '@/components/ui/dialog';
import { MedicationForm } from '@/components/medication-form';
import MedicationCard from '@/components/medication-card';
import { NotificationHandler } from './notification-handler';
import type { AuthUser } from '@/types';

interface MedicationsViewProps {
    user: AuthUser;
    profile: UserProfile | null;
    viewingProfile: UserProfile; // The profile of the person whose meds are being shown
}

export function MedicationsView({ user, profile, viewingProfile }: MedicationsViewProps) {
  const [medications, setMedications] = React.useState<Medication[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [editingMedication, setEditingMedication] = React.useState<Medication | null>(null);

  React.useEffect(() => {
    if (viewingProfile) {
      setLoading(true);
      const medQuery = query(collection(db, 'medications'), where('userId', '==', viewingProfile.userId));
      const unsubscribeMeds = onSnapshot(medQuery, (querySnapshot) => {
        const meds: Medication[] = [];
        querySnapshot.forEach((doc) => {
          meds.push({ id: doc.id, ...doc.data() } as Medication);
        });
        setMedications(meds.sort((a, b) => a.name.localeCompare(b.name)));
        setLoading(false);
      }, (error) => {
          console.error("Medication snapshot error:", error);
          setLoading(false);
      });

      return () => unsubscribeMeds();
    } else {
      setLoading(false);
      setMedications([]);
    }
  }, [viewingProfile]);

  const handleEdit = (med: Medication) => {
    setEditingMedication(med);
    setIsFormOpen(true);
  };

  const handleAddNew = () => {
    setEditingMedication(null);
    setIsFormOpen(true);
  };
  
  const isViewingSelf = user.uid === viewingProfile.userId;
  
  return (
    <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
       <NotificationHandler medications={medications} profile={profile} viewingWhoseMeds={viewingProfile.userId}/>
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight font-headline">
              {isViewingSelf ? "My Medications" : `${viewingProfile.name}'s Medications`}
          </h1>
        </div>
         <div className="flex items-center space-x-4 mb-8">
            <DialogTrigger asChild>
                <Button onClick={handleAddNew} size="lg">
                <PlusCircle className="mr-2 h-4 w-4" /> Add Medication
                </Button>
            </DialogTrigger>
        </div>
        {loading ? (
          <p>Connecting to the database...</p>
        ) : medications.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {medications.map((med) => (
              <MedicationCard key={med.id} medication={med} onEdit={() => handleEdit(med)} />
            ))}
          </div>
        ) : (
            <div className="text-center py-16 border-2 border-dashed rounded-lg mt-8">
                <Pill className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-medium text-muted-foreground">
                    {isViewingSelf ? "No medications yet" : `${viewingProfile.name} has no medications`}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                    {isViewingSelf ? "Add your first medication to get started." : "Add a medication for them to get started."}
                </p>
            </div>
        )}
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{editingMedication ? 'Edit Medication' : 'Add Medication'}</DialogTitle>
           <DialogDescription>
            {isViewingSelf ? "Manage your medication details." : `Adding or editing a medication for ${viewingProfile.name}.`}
          </DialogDescription>
        </DialogHeader>
        <MedicationForm
          medication={editingMedication}
          onFinished={() => {
            setIsFormOpen(false);
          }}
          userId={viewingProfile.userId}
        />
      </DialogContent>
    </Dialog>
  );
}
